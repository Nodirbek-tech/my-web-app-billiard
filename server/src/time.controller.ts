import { Controller, Get } from '@nestjs/common';

@Controller()
export class TimeController {
  @Get('time')
  getTime() {
    return {
      serverTime: new Date().toISOString(),
      tashkentTime: new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' }),
    };
  }
}
