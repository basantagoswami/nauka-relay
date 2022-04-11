import { Column, Entity, ObjectIdColumn } from "typeorm";

@Entity({name: 'events'})
export class Event {
    @ObjectIdColumn()
    id: string;

    @Column()
    pubkey: string;

    @Column()
    created_at: string;

    @Column()
    kind: number;

    @Column()
    tags: [[], []];

    @Column()
    content: string;

    @Column()
    sig: string;
}