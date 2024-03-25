import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { getAppPort } from "./config";
import { AllExceptionsFilter } from "./all-exceptions.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = getAppPort(5010); // 如果未设置端口，默认使用5010端口
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(port);
}

bootstrap().then(r => {
});
