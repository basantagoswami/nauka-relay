import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Event } from './events.entity';

@Entity({ name: 'tags' })
export class Tag {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  tag: string;

  @Column({ nullable: true })
  recommended_relay_url: string;

  @ManyToMany(() => Event, (event) => event.tags)
  event: Event[];
}
