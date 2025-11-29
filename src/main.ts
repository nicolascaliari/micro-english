import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar validación global con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3001;
  
  await app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Aplicación corriendo en el puerto: ${port}`);
    console.log(`📡 Server listening on 0.0.0.0:${port}`);
    console.log('✅ Aplicación lista para recibir peticiones');
  });
}

bootstrap().catch((error) => {
  console.error('❌ Error en la conexión a MongoDB:', error);
  process.exit(1);
});
