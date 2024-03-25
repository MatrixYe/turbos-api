import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";

@Catch() // 未指定异常类型，表示捕获所有异常
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // 设置默认的错误消息和状态码
    let message = "Unknown internal service error";
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

    // 如果异常是HttpException的实例，获取异常中的状态码和消息
    if (exception instanceof HttpException) {
      // 如果是HttpException，从中提取状态码和消息
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = exceptionResponse["message"] || exceptionResponse;
    } else if (typeof exception === "string") {
      // 如果异常是字符串类型的错误消息
      message = exception;
    } else if (exception instanceof Error) {
      // 如果异常是Error实例，使用其消息
      message = exception.message;
    }


    response.status(statusCode).json({
      statusCode,
      message,
    });
  }
}
