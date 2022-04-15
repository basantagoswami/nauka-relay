import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SharedService } from 'src/shared/shared.service';
import { Repository } from 'typeorm';
import { Event } from './entities/events.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepo: Repository<Event>,
    private sharedService: SharedService,
  ) {}

  async handleEvent(event: Event) {
    if (await this.sharedService.validateEvent(event)) {
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
