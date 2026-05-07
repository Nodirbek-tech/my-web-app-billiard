"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
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