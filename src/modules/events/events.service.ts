import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepo: Repository<Event>
  ) {}
    
  handleEvent(event: Event) {
    this.eventsRepo.insert(event);
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
