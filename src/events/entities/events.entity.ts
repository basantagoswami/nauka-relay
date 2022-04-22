import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn } from 'typeorm';
import { Tag } from './tags.entity';

@Entity({ name: 'events' })
export class Event {
  @PrimaryColumn()
  id: string;

  @Column()
  pubkey: string;

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
