import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
const compression = require('compression');
import type { Request, Response, NextFunction } from 'express';

const logger = new Logger('HTTP');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.use(compression());

  // Slow-request logging (>300ms)
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      const ms = Date.now() - start;
      if (ms > 300) {
        logger.warn(`SLOW ${req.method} ${req.url} — ${ms}ms [${res.statusCode}]`);
      }
    });
    next();
  });

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // server-to-server / same-origin
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      if (origin === clientUrl) return callback(null, true);
      if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
      // Allow RFC-1918 private LAN ranges (192.168.x.x, 172.16-31.x.x, 10.x.x.x)
      if (/^https?:\/\/(192\.168|172\.(1[6-9]|2\d|3[01])|10)\.\d+\.\d+(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      logger.warn(`CORS blocked request from: ${origin}`);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );

  app.useWebSocketAdapter(new IoAdapter(app));

  const config = new DocumentBuilder()
    .setTitle('Billiard Club API')
    .setDescription('Billiard Club Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, config));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/api`);
}

bootstrap();
