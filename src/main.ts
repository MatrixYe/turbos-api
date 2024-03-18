import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { getAppPort } from "./config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = getAppPort(5010); // 如果未设置端口，默认使用5010端口
  await app.listen(port);
}

bootstrap();
