import { NestFactory, Reflector } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import type { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Atrás de proxies (túnel -> nginx): TRUST_PROXY = nº de saltos confiáveis,
  // para req.ip ser o IP real do cliente (rate limit do login por IP).
  const trustProxy = Number(process.env.TRUST_PROXY);
  if (trustProxy > 0) app.set('trust proxy', trustProxy);

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

  // Swagger fica ligado por padrão; SWAGGER_ENABLED=false esconde quando o
  // site está público.
  if (process.env.SWAGGER_ENABLED !== 'false') {
    const config = new DocumentBuilder()
      .setTitle('CoreSync API')
      .setDescription('Documentação da API do CoreSync')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(process.env.PORT || 8080);
}
bootstrap();
