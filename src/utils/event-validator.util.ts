import { Event } from 'src/modules/events/entities/events.entity';
import * as secp256k1 from '@noble/secp256k1';

// SHA256
export function sha256(message) {
  return secp256k1.utils.sha256(Uint8Array.from(message));
}

// Get event hash
export async function getEventHash(event) {
  let eventHash = await sha256(Buffer.from(serializeEvent(event)));
  return Buffer.from(eventHash).toString('hex');
}

// Verify signature
export async function verifySignature(event: Event) {
  return await secp256k1.schnorr.verify(event.sig, event.id, event.pubkey);
}

// Serialize event
export function serializeEvent (event: Event) {
  return JSON.stringify([
    0,
    event.pubkey,
    event['created_at'],
    event.kind,
    event.tags || [],
    event.content,
  ]);
};

// Format notice
export function formatNotice(message: string) {
    return JSON.stringify(['NOTICE', message]);
}

// Validate event
export async function validateEvent(event: Event) {
    if(await getEventHash(event) == event.id) {
        if(await verifySignature(event) == true)
            return true;
    }
    return false;
}
