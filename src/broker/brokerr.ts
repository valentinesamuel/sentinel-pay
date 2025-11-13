import {
  Injectable,
  Logger,
  RequestTimeoutException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Usecase } from './types';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';

// Define specific return type for clarity
export interface UsecaseResult {
  [key: string]: unknown;
}

@Injectable()
export class Broker {
  private readonly logger = new Logger(Broker.name);
  private readonly DEFAULT_TIMEOUT = 60000;
  // Default isolation level
  private readonly DEFAULT_ISOLATION = 'READ COMMITTED' as IsolationLevel;

  constructor(@InjectEntityManager() private entityManager: EntityManager) {}

  async runUsecases(
    usecases: Usecase[],
    initialArguments: Record<string, any> = {},
    timeoutMs = this.DEFAULT_TIMEOUT,
    isolationLevel = this.DEFAULT_ISOLATION,
  ): Promise<UsecaseResult> {
    // Validate inputs
    if (!Array.isArray(usecases) || usecases.length === 0) {
      throw new BadRequestException('At least one usecase must be provided');
    }

    for (const usecase of usecases) {
      if (!usecase || typeof usecase.execute !== 'function') {
        throw new InternalServerErrorException('Invalid usecase provided: missing execute method');
      }
    }

    if (timeoutMs <= 0) {
      throw new InternalServerErrorException('Timeout must be greater than 0');
    }

    let timeoutId: NodeJS.Timeout | undefined;

    try {
      // Only create timeout promise if timeout is reasonable
      const promises: Promise<any>[] = [
        this.executeTransaction(usecases, initialArguments, isolationLevel),
      ];

      if (timeoutMs < Infinity) {
        promises.push(this.createTimeoutPromise(timeoutMs));
      }

      // Run with possible timeout
      const result = await Promise.race(promises);
      return result;
    } catch (error) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      this.logger.error('Transaction failed', error instanceof Error ? error.stack : String(error));

      this.logger.error({
        message: 'Transaction failed',
        error: error instanceof Error ? error.message : String(error),
        errorType: 'transaction_error',
        errorStack: error instanceof Error ? error.stack : String(error),
        errorName: error instanceof Error ? error.name : 'UnknownError',
        errorDetails: error instanceof Error ? error.message : String(error),
      });
      // Re-throw the error for caller handling
      throw error;
    }
  }

  private async executeTransaction(
    usecases: Usecase[],
    initialArguments: Record<string, unknown>,
    isolationLevel: IsolationLevel,
    onTransactionStart?: (tem: EntityManager) => void,
  ): Promise<UsecaseResult> {
    return this.entityManager.transaction(isolationLevel, async (transactionalEntityManager) => {
      // Only call the callback if provided
      if (onTransactionStart) {
        onTransactionStart(transactionalEntityManager);
      }

      return this.runAllUsecases(usecases, { ...initialArguments }, transactionalEntityManager);
    });
  }

  private createTimeoutPromise(timeoutMs: number): Promise<never> {
    return new Promise((_, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new RequestTimeoutException(`Transaction timed out after ${timeoutMs}ms.`));
      }, timeoutMs);

      // Ensure the timeout is cleared if the promise is garbage collected
      if (typeof timeoutId.unref === 'function') {
        timeoutId.unref();
      }

      // Return the timeoutId for potential cleanup
      return timeoutId;
    });
  }

  private async runAllUsecases(
    usecases: Usecase[],
    initialArguments: Record<string, unknown>,
    transactionalEntityManager: EntityManager,
  ): Promise<UsecaseResult> {
    this.logTransactionStart(usecases.length, initialArguments);

    // Create a new object to avoid modifying the input
    let results: Record<string, unknown> = { ...initialArguments };

    // Execute each usecase in sequence, checking for cancellation between each
    for (const useCase of usecases) {
      results = await this.executeSingleUsecase(useCase, results, transactionalEntityManager);
    }

    return this.cleanResults(results, initialArguments);
  }

  private logTransactionStart(usecaseCount: number, initialArgs: Record<string, unknown>): void {
    try {
      this.logger.debug(`Starting transaction with ${usecaseCount} usecases`);

      // Safely serialize the input, handling circular references
      const safeArgs = this.safeStringify(initialArgs);
      this.logger.debug(`Initial arguments: ${safeArgs}`);
    } catch (error) {
      this.logger.warn(
        'Failed to log transaction start',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  private async executeSingleUsecase(
    useCase: Usecase,
    currentResults: Record<string, unknown>,
    transactionalEntityManager: EntityManager,
  ): Promise<Record<string, unknown>> {
    const useCaseName = useCase.constructor.name;
    this.logger.debug(`Executing usecase: ${useCaseName}`);

    const startTime = Date.now();
    try {
      // Create a defensive copy of the results to pass to the usecase
      const result = await useCase.execute(transactionalEntityManager, { ...currentResults });

      // Validate result is an object
      if (!result || typeof result !== 'object') {
        throw new Error(`Usecase ${useCaseName} returned invalid result: ${typeof result}`);
      }

      this.logUsecaseCompletion(useCaseName, startTime);

      // Combine results, preserving the original and adding new properties
      return { ...currentResults, ...result };
    } catch (error) {
      await transactionalEntityManager.query('ROLLBACK');
      this.logUsecaseFailure(useCaseName, startTime, error);
      throw error;
    }
  }

  private logUsecaseCompletion(useCaseName: string, startTime: number): void {
    const duration = Date.now() - startTime;
    this.logger.debug(`Usecase ${useCaseName} completed in ${duration}ms`);
  }

  private logUsecaseFailure(useCaseName: string, startTime: number, error: unknown): void {
    const duration = Date.now() - startTime;
    this.logger.error(
      `Usecase ${useCaseName} failed after ${duration}ms`,
      error instanceof Error ? error.stack : String(error),
    );
  }

  private cleanResults(
    results: Record<string, unknown>,
    initialArguments: Record<string, unknown>,
  ): UsecaseResult {
    try {
      // Create a new object instead of modifying the input
      const cleaned: Record<string, unknown> = { ...results };

      // Remove initial arguments
      for (const key in initialArguments) {
        delete cleaned[key];
      }

      // Remove sensitive data (add more fields as needed)
      const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'api_key'];
      for (const field of sensitiveFields) {
        if (field in cleaned) {
          delete cleaned[field];
        }
      }

      const safeResults = this.safeStringify(cleaned);
      this.logger.debug(`Transaction completed with results: ${safeResults}`);
      return cleaned;
    } catch (error) {
      this.logger.warn(
        'Error in cleanResults',
        error instanceof Error ? error.message : String(error),
      );
      // Return empty object rather than failing the entire transaction
      return {};
    }
  }

  /**
   * Safely stringify objects, handling circular references
   */
  private safeStringify(obj: unknown): string {
    try {
      const seen = new WeakSet();
      return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular Reference]';
          }
          seen.add(value);
        }
        return value;
      });
    } catch (error) {
      this.logger.warn(
        'Failed to stringify object',
        error instanceof Error ? error.message : String(error),
      );
      return '[Object cannot be serialized]';
    }
  }
}
