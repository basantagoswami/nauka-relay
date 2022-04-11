import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsGateway } from './events.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/events.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event])],
  providers: [EventsService, EventsGateway],
})
export class EventsModule {}
