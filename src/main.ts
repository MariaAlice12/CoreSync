import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Exemplo de API')
    .setDescription('Documentação da API com Swagger')
    .setVersion('1.0')
    .addTag('exemplo') // Opcional
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // /api será o endpoint da documentação
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
