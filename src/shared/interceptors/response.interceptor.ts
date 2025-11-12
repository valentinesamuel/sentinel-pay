import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Response, Request } from 'express';

export interface TResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  result: T;
  path: string;
  duration: number;
  timestamp: number;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, TResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<TResponse<T>> {
    const startTime = Date.now(); // Start time
    return next.handle().pipe(
      map((res: unknown) => this.responseHandler(res, context, startTime)),
      catchError((err: HttpException) =>
        throwError(() => this.errorHandler(err, context, startTime)),
      ),
    );
  }

  // Handles success response
  responseHandler(res: any, context: ExecutionContext, startTime: number): TResponse<T> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const statusCode = response.statusCode;

    // Extract custom message if provided, otherwise use default
    const message = res?.message || 'Request successful';

    // If res contains a message property, exclude it from result to avoid duplication
    const result = res?.message ? { ...res, message: undefined } : res;

    return {
      statusCode,
      success: true,
      message,
      result,
      path: request.url,
      duration: Date.now() - startTime,
      timestamp: Date.now(),
    };
  }

  // Handles error response
  errorHandler(exception: any, context: ExecutionContext, startTime: number): any {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const message = exception?.getResponse ? exception?.getResponse().message : exception.message;
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof BadRequestException) {
      if (typeof message === 'object') {
        const responseMsr = message.map((data: any) => {
          const issues = {
            field: '',
            errors: [],
          };
          if (data?.constraints) {
            issues.field = data.property;
            for (const key of Object.keys(data.constraints)) {
              issues.errors.push(data.constraints[key]);
            }
          }
          if (data?.children) {
            data.children.forEach((element: any) => {
              issues.field = `${data.property}.${element.property}`;
              for (const key of Object.keys(element.constraints)) {
                issues.errors.push(element.constraints[key]);
              }
            });
          }
          return issues;
        });

        return response.status(status).json({
          statusCode: status,
          success: false,
          message: 'Bad Request',
          errors: responseMsr,
          path: request.path,
          duration: Date.now() - startTime,
          timestamp: Date.now(),
        });
      }
    }

    response.status(status).json({
      statusCode: status,
      success: false,
      message: message ?? 'Request failed',
      path: request.url,
      duration: Date.now() - startTime,
      timestamp: Date.now(),
    });
  }
}
