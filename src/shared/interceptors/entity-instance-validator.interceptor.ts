/* eslint-disable no-restricted-syntax */
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseEntity } from '../repositories/base.entity';

/**
 * Interceptor that validates responses contain proper entity instances
 * and strips any leaked internal IDs as a safety measure
 */
@Injectable()
export class EntityInstanceValidatorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(EntityInstanceValidatorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Skip validation for non-object responses (strings, numbers, etc.)
        if (!data || typeof data !== 'object') {
          return data;
        }

        // Validate and sanitize the response
        return this.validateAndSanitize(data, context);
      }),
    );
  }

  private validateAndSanitize(data: any, context: ExecutionContext): any {
    const handler = context.getHandler().name;
    const controller = context.getClass().name;

    if (Array.isArray(data)) {
      return data.map((item) => this.validateAndSanitizeItem(item, controller, handler));
    }

    // Handle paginated responses
    if (data.data && Array.isArray(data.data)) {
      return {
        ...data,
        data: data.data.map((item) => this.validateAndSanitizeItem(item, controller, handler)),
      };
    }

    return this.validateAndSanitizeItem(data, controller, handler);
  }

  private validateAndSanitizeItem(item: any, controller: string, handler: string): any {
    if (!item || typeof item !== 'object') {
      return item;
    }

    // Check if it's a BaseEntity instance
    if (item instanceof BaseEntity) {
      // It's a proper entity instance, sanitize it
      return this.sanitizeEntity(item);
    }

    // Check if it's a plain object that looks like an entity (has both id and publicId)
    if (this.looksLikeEntity(item)) {
      this.logger.warn(
        `Potential plain object returned instead of entity instance in ${controller}.${handler}. ` +
          `This may bypass serialization. Consider returning the entity instance directly.`,
      );
      // Sanitize it anyway as a safety measure
      return this.sanitizePlainObject(item);
    }

    // For nested objects, recursively sanitize
    return this.sanitizeNested(item);
  }

  private looksLikeEntity(obj: any): boolean {
    // Check if object has both numeric id and publicId (characteristics of BaseEntity)
    return (
      'id' in obj &&
      typeof obj.id === 'number' &&
      'publicId' in obj &&
      typeof obj.publicId === 'string'
    );
  }

  private sanitizeEntity(entity: BaseEntity): any {
    // The ClassSerializerInterceptor should handle this,
    // but we double-check here as a safety measure
    const plainObject = JSON.parse(JSON.stringify(entity));
    return this.sanitizePlainObject(plainObject);
  }

  private sanitizePlainObject(obj: any): any {
    // If object has both numeric id and publicId, remove the numeric id
    if (this.looksLikeEntity(obj)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = obj;
      this.logger.debug(`Stripped internal numeric ID from response`);
      return rest;
    }
    return obj;
  }

  private sanitizeNested(obj: any): any {
    const result = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (Array.isArray(value)) {
          result[key] = value.map((item) =>
            typeof item === 'object' ? this.sanitizeNested(item) : item,
          );
        } else if (value && typeof value === 'object') {
          result[key] = this.sanitizePlainObject(value);
        } else {
          result[key] = value;
        }
      }
    }
    return result;
  }
}
