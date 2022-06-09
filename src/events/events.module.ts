import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsGateway } from './events.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/events.entity';
import { SharedModule } from 'src/shared/shared.module';
import { EventsQueries } from './events.queries';
import { Pubkey } from './entities/pubkeys.entity';
import { Tag } from './entities/tags.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Pubkey, Tag]), SharedModule],
  providers: [EventsService, EventsGateway, EventsQueries],
})
export class EventsModule {}
