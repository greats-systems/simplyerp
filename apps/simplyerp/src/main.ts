import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const options = {
    origin: "*",
  };
  app.enableCors(options);
  await app.listen(4006);
}
bootstrap();
