import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validateEvent } from 'src/utils/event-validator.util';
import { Repository } from 'typeorm';
import { Event } from './entities/events.entity'

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepo: Repository<Event>
  ) {}
    
  async handleEvent(event: Event) {
    if(await validateEvent(event)) {
      this.eventsRepo.insert(event);
    }
    console.log();
  }

  handleRequest(subscriptionId: string, filters: any[]) {
    console.log(`SUBSCRIPTION ID: ${subscriptionId}`);
    console.log(`FILTERS:`);
    filters.forEach((filter) => {
      console.log(filter);
    });
  }

  handleClose(subscriptionId: string) {
    console.log(subscriptionId);
  }
}
