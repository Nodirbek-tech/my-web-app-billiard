"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const compression = require('compression');
const logger = new common_1.Logger('HTTP');
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    app.use(compression());
    app.use((req, res, next) => {
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
            if (!origin)
                return callback(null, true);
            const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
            if (origin === clientUrl)
                return callback(null, true);
            if (/^https?:\/\/localhost(:\d+)?$/.test(origin))
                return callback(null, true);
            if (/^https?:\/\/(192\.168|172\.(1[6-9]|2\d|3[01])|10)\.\d+\.\d+(:\d+)?$/.test(origin)) {
                return callback(null, true);
            }
            logger.warn(`CORS blocked request from: ${origin}`);
            callback(new Error(`CORS blocked: ${origin}`));
        },
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    app.useWebSocketAdapter(new platform_socket_io_1.IoAdapter(app));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Billiard Club API')
        .setDescription('Billiard Club Management System')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    swagger_1.SwaggerModule.setup('api', app, swagger_1.SwaggerModule.createDocument(app, config));
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Swagger docs at http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map