import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { setupLegacyProxy } from './utils/setup-proxy';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.enableCors({
    origin: configService.getOrThrow<string>('ALLOWED_ORIGIN'),
    credentials: true,
  });
  setupLegacyProxy(app.getHttpAdapter().getInstance());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const port = configService.getOrThrow<number>('PORT');
  await app.listen(port);
}
bootstrap();
