import { Injectable } from '@nestjs/common';
import { RequestFilterDto } from './dto/request-filter.dto';
import { Event } from './entities/events.entity';
import { EventKind } from './enums/event-kind';
import { EventsQueries } from './events.queries';

@Injectable()
export class EventsService {
  SUBSCRIPTIONS = [];

  constructor(private eventsQueries: EventsQueries) {}

  /**
   * Handle Event
   * Save event to database or delete event
   */
  async handleEvent(event: Event) {
    switch (event.kind) {
      case EventKind.set_metadata:
      case EventKind.text_note:
      case EventKind.recommend_server:
      case EventKind.encrypted_direct_message:
        event.tags.forEach((tag) => {
          tag.name = tag[0];
          tag.tag = tag[1];
        });
        await this.eventsQueries.saveEvent(event);
        break;
      case EventKind.deletion:
        console.log('Event deletion is yet to be implemented');
    }
  }

  /**
   * Handle Request
   * Save subscription & return events matched with req filter
   */
  async handleRequest(
    subscriptionId: string,
    clientId: string,
    filters: RequestFilterDto[],
  ): Promise<Event[]> {
    // If sub array is empty, push the first sub
    if (!this.SUBSCRIPTIONS.length) {
      this.SUBSCRIPTIONS.push([subscriptionId, clientId, filters]);
    }
    // If subs array isn't empty:
    // replace filters if sub already exists, else push new sub
    else {
      let subExists = false;
      this.SUBSCRIPTIONS.forEach((sub) => {
        if (sub[0] == subscriptionId && sub[1] == clientId) {
          subExists = true;
          sub[1] = clientId;
          sub[1] = filters;
        }
      });
      if (!subExists)
        this.SUBSCRIPTIONS.push([subscriptionId, clientId, filters]);
    }

    // Return events matched with filters
    const matchedEvents = (await this.eventsQueries.fetchEventsWithFilters(
      filters,
    )) as any;

    matchedEvents.forEach((event) => {
      const tags = event.tags.map((tag) =>
        JSON.parse(`["${tag.name}", "${tag.tag}"]`),
      );
      event.tags = tags;
    });
    return matchedEvents;
  }

  /**
   * Handle Close
   * Delete sub from subs on CLOSE event
   */
  handleClose(subscriptionId: string, clientId: string) {
    for (let i = 0; i < this.SUBSCRIPTIONS.length; i++) {
      if (
        this.SUBSCRIPTIONS[i][0] == subscriptionId &&
        this.SUBSCRIPTIONS[i][1] == clientId
      )
        this.SUBSCRIPTIONS.splice(i, 1);
    }
  }

  /**
   * Fetch Matched Subs
   * Return subs with filters that would want this event
   */
  fetchMatchedSubs(event: Event): Set<string> {
    // real ugly... but it works
    const matchedSubs = [];
    const { id, pubkey, created_at, kind, tags } = event;

    this.SUBSCRIPTIONS.forEach((subscription) => {
      subscription[2].forEach((filter) => {
        const filterPropertyCount = Object.keys(filter).length;
        let matches = 0;

        Object.entries(filter).forEach((entry) => {
          const key = entry[0];
          const value = entry[1] as any;

          switch (key) {
            case 'ids':
              if (value.includes(id)) matches++;
              break;
            case 'kinds':
              if (value.includes(kind)) matches++;
              break;
            case '#e':
              tags.forEach((tag) => {
                if (tag.name == 'e') if (value.includes(tag.tag)) matches++;
              });
              break;
            case '#p':
              tags.forEach((tag) => {
                if (tag.name == 'p') if (value.includes(tag.tag)) matches++;
              });
              break;
            case 'since':
              if (value <= created_at) matches++;
              break;
            case 'until':
              if (value >= created_at) matches++;
              break;
            case 'authors':
              if (value.includes(pubkey)) matches++;
              break;
          }
        });
        if (matches >= filterPropertyCount)
          matchedSubs.push([subscription[0], subscription[1]]);
      });
    });

    return new Set(matchedSubs);
  }
}
