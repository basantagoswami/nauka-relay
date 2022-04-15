import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'events' })
export class Event {
  @PrimaryColumn()
  id: string;

  @Column()
  pubkey: string;

  @Column()
  created_at: string;

  @Column()
  kind: number;

  @Column()
  tags: string;

  @Column()
  content: string;

  @Column()
  sig: string;
}
