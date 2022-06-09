import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Event } from './events.entity';

@Entity({ name: 'pubkeys' })
export class Pubkey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  value: string;

  @OneToMany(() => Event, (event) => event.pubkey)
  events: Event[];
}
