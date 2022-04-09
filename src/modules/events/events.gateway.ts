import { Injectable } from '@nestjs/common';
import { EventDto } from './dto/event.dto';

@Injectable()
export class EventsGateway {
  handleEvent(event: EventDto) {
    console.log(event);
  }

  handleRequest(subscriptionId: string, filters: any[]) {
    console.log(`SUBSCRIPTION ID: ${subscriptionId}`);
    console.log(`FILTERS:`);
    filters.forEach(filter => {
      console.log(filter);
    });
  }

  handleClose(subscriptionId: string) {
    console.log(subscriptionId);
  }
}
