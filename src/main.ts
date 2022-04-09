import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { webSocketServerInit } from './websockets/WsServer';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  webSocketServerInit(app) // Create ws server with 'ws'
  await app.listen(3000);
}
bootstrap();
