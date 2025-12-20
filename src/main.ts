import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import 'dotenv/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  logger.log(`Database URL: ${process.env.DATABASE_URL}`);
  logger.log(`DB_HOST: ${process.env.DB_HOST}`);
  logger.log(`DB_USER: ${process.env.DB_USER}`);
  logger.log(`DB_PASSWORD: ${process.env.DB_PASSWORD ? '***' : 'NOT SET'}`);
  logger.log(`THE APP IS AVAILABLE ON PORT: ${process.env.PORT}`);
  
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: true, // Allow all origins in development
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  
  const config = new DocumentBuilder()
    .setTitle('Stackr API')
    .setDescription('API documentation for Stackr')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Swagger documentation available at http://localhost:${port}/api`);
}

void bootstrap();
