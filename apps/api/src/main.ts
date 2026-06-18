import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { setupRLSPolicies } from './database/rls-setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Setup RLS Policies in PostgreSQL
  try {
    const dataSource = app.get(DataSource);
    await setupRLSPolicies(dataSource);
  } catch (err) {
    console.warn('RLS policies setup skipped (PostgreSQL connection failed or offline):', err.message);
  }
  
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
