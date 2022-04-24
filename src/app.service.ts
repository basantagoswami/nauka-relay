import { Injectable } from '@nestjs/common';
import { relayInfo } from './utils/constants/relay-info.util';

@Injectable()
export class AppService {
  welcome(): string {
    return 'Use a #nostr client to connect to this relay';
  }

  getRelayInfo() {
    return relayInfo;
  }
}
