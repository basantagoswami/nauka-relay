import { Injectable } from '@nestjs/common';
import { schnorr, utils } from '@noble/secp256k1';
import { EventDto } from 'src/events/dto/event.dto';

@Injectable()
export class SharedService {
  // SHA256
  async sha256(message: string): Promise<string> {
    return Buffer.from(
      await utils.sha256(Uint8Array.from(Buffer.from(message))),
    ).toString('hex');
  }

  // Serialize event
  serializeEvent(event: EventDto): string {
    return JSON.stringify([
      0,
      event.pubkey,
      event['created_at'],
      event.kind,
      event.tags || [],
      event.content,
    ]);
  }

  // Verify signature
  async verifySignature(event: EventDto): Promise<boolean> {
    return schnorr.verify(event.sig, event.id, event.pubkey);
  }

  // Get event hash
  async getEventHash(event: EventDto): Promise<string> {
    return this.sha256(this.serializeEvent(event));
  }

  // Validate event
  async validateEvent(event: EventDto): Promise<boolean> {
    if ((await this.getEventHash(event)) == event.id) {
      if ((await this.verifySignature(event)) == true) return true;
    }
    return false;
  }

  // Format notice
  formatNotice(message: string): string {
    return JSON.stringify(['NOTICE', message]);
  }

  // Format event message
  formatEvent(subscriptionId: string, event: EventDto) {
    return `["EVENT", "${subscriptionId}", ${JSON.stringify(event)}]`;
  }
}
