import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import type { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cabeçalhos de segurança (XSS, clickjacking, sniffing de MIME...).
  // As fotos em /uploads são carregadas pelo front em outra origem; a UI do
  // Swagger (/api) usa scripts inline, então fica sem CSP.
  const secureHeaders = helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });
  const swaggerHeaders = helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  });
  app.use((req: Request, res: Response, next: NextFunction) =>
    (req.path.startsWith('/api') ? swaggerHeaders : secureHeaders)(
      req,
      res,
      next,
    ),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',')
      : ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const config = new DocumentBuilder()
    .setTitle('CoreSync API')
    .setDescription('Documentação da API do CoreSync')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 8080);
}
bootstrap();
