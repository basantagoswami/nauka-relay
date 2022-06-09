import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Pubkey } from './pubkeys.entity';
import { Tag } from './tags.entity';

@Entity({ name: 'events' })
export class Event {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => Pubkey, (pubkey) => pubkey.events)
  pubkey: Pubkey;

  @Column()
  created_at: number;

  @Column()
  kind: number;

  @ManyToMany(() => Tag, (tag) => tag.event, { cascade: true, eager: true })
  @JoinTable()
  tags: Tag[];

  @Column()
  content: string;

  @Column()
  sig: string;
}
