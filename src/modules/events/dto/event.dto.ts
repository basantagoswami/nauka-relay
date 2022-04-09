export class EventDto {
  id: string;
  pubkey: string;
  created_at: string;
  kind: number;
  tags: [[], []];
  content: string;
  sig: string;
}
