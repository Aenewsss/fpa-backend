import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
const PORT = 3003;

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://portalfpa.vercel.app',
      'https://fpa-frontend-theta.vercel.app',
      'https://agenciafpa.com.br',
    ]
  })
  
  // Pipes (validação global dos DTOs)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Interceptor global para padronizar os retornos
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Filter global para padronizar os erros
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Portal de Notícias')
    .setDescription('API para gestão de usuários e autenticação')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app as any, config);
  SwaggerModule.setup('docs', app as any, document);

  await app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
}
bootstrap();
