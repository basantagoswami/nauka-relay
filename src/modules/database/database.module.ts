import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Event } from '../events/entities/events.entity';

@Module({
    imports: [TypeOrmModule.forRoot({
        useUnifiedTopology: true,
        type: 'mongodb',
        host: 'localhost',
        port: 27017,
        username: '',
        password: '',
        database: '',
        entities: [Event],
        synchronize: false,
    })]
})
export class DatabaseModule { }