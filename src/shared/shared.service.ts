import { Injectable } from '@nestjs/common';
import { Event } from 'src/events/entities/events.entity';
import * as secp256k1 from '@noble/secp256k1';

@Injectable()
export class SharedService {
  // SHA256
  sha256(message) {
    return secp256k1.utils.sha256(Uint8Array.from(message));
  }

  // Get event hash
  async getEventHash(event) {
    const eventHash = await this.sha256(
      Buffer.from(this.serializeEvent(event)),
    );
    return Buffer.from(eventHash).toString('hex');
  }

  // Verify signature
  async verifySignature(event: Event) {
    return await secp256k1.schnorr.verify(event.sig, event.id, event.pubkey);
  }

  // Serialize event
  serializeEvent(event: Event) {
    return JSON.stringify([
      0,
      event.pubkey,
      event['created_at'],
      event.kind,
      event.tags || [],
      event.content,
    ]);
  }

  // Validate event
  async validateEvent(event: Event) {
    if ((await this.getEventHash(event)) == event.id) {
      if ((await this.verifySignature(event)) == true) return true;
    }
    return false;
  }

  // Format notice
  formatNotice(message: string) {
    return JSON.stringify(['NOTICE', message]);
  }

  // Format event message
  formatEvent(subscriptionId: string, event) {
    return `["EVENT", "${subscriptionId}", ${JSON.stringify(event)}]`;
  }
}
