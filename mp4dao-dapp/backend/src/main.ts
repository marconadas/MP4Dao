import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configurações de segurança
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        imgSrc: [`'self'`, 'data:', 'https:'],
      },
    },
  }));
  
  // Compressão
  app.use(compression());

  // CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: configService.get('CORS_CREDENTIALS', true),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Prefixo global da API
  const apiPrefix = configService.get('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // Pipes globais
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Filtros globais
  app.useGlobalFilters(new HttpExceptionFilter());

  // Interceptors globais
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Swagger Documentation
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Mp4Dao API')
      .setDescription('API para registo de copyright musical em Angola')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        'access-token',
      )
      .addTag('auth', 'Autenticação e autorização')
      .addTag('works', 'Gestão de obras musicais')
      .addTag('disputes', 'Sistema de disputas')
      .addTag('storage', 'Armazenamento de ficheiros')
      .addTag('blockchain', 'Interação com blockchain')
      .addTag('analytics', 'Analytics e relatórios')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });

    console.log(`📚 Swagger docs: http://localhost:${configService.get('PORT', 3001)}/${apiPrefix}/docs`);
  }

  // Iniciar servidor
  const port = configService.get('PORT', 3001);
  await app.listen(port);

  console.log(`🚀 Mp4Dao API running on: http://localhost:${port}/${apiPrefix}`);
  console.log(`🎵 Revolutionizing music copyright in Angola! 🇦🇴`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start Mp4Dao API:', error);
  process.exit(1);
});
