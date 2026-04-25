import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionFilter } from './common/filters/all-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new AllExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  // ✅ Swagger Config
  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('API documentation for my NestJS project')
    .setVersion('1.0')
    .addBearerAuth() // 🔐 for JWT (important later)
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);
  // 👉 http://localhost:3000/api

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
