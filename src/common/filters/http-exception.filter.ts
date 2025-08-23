// src/common/filters/http-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ResponseMessageEnum } from '../enums/response-message.enum';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: ResponseMessageEnum | string = ResponseMessageEnum.GENERIC_ERROR;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as Record<string, any>;
        message = responseObj.message || ResponseMessageEnum.GENERIC_ERROR;
      } else {
        message = exceptionResponse as string;
      }
    }

    response.status(status).json({
      error: true,
      message,
      data: null,
    });
  }
}
