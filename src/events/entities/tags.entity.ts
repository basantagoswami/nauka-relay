import {
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Event } from './events.entity';

@Entity({ name: 'tags' })
@Unique('unique_tag', ['type', 'value', 'recommended_relay_url'])
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  value: string;

  @Column({ nullable: true })
  recommended_relay_url: string;

  @ManyToMany(() => Event, (event) => event.tags)
  event: Event[];
}
