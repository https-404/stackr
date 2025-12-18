import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import 'dotenv/config';

async function bootstrap() {
  console.log('Database URL: ', process.env.DATABASE_URL);
  console.log('DB_HOST: ', process.env.DB_HOST);
  console.log('DB_USER: ', process.env.DB_USER);
  console.log('DB_PASSWORD: ', process.env.DB_PASSWORD ? '***' : 'NOT SET');
  console.log('THE APP IS AVAILABLE ON PORT:', process.env.PORT);
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
