import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  welcome(@Req() req): any {
    // NIP-11: if header.accept is application/nostr+json, return relay info
    if (req.headers.accept == 'application/nostr+json')
      return this.appService.getRelayInfo();
    else return this.appService.welcome();
  }
}
