import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  welcome(): string {
    return 'Use a #nostr client to connect to this relay';
  }

  getRelayInfo() {
    return {
      name: process.env.RELAY_NAME || 'Nauka Relay',
      description:
        process.env.RELAY_DESCRIPTION ||
        'A relay written in nodeJS, still very much an experiment',
      pubkey: process.env.RELAY_PUBKEY,
      contact: process.env.RELAY_CONTACT,
      supported_nips: [1, 11],
      software: 'https://github.com/basantagoswami/nauka',
      version: '0.0.1',
    };
  }
}
