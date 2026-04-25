import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';
    let error: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res: any = exception.getResponse();

      message = res.message || exception.message;
      error = res.error || null;
    }

    // 🔥 log error (important for debugging)
    console.error('Error =>', exception);

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      error,
      data: null,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
