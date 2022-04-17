import { Injectable } from '@nestjs/common';
import { RequestFilterDto } from './dto/request-filter.dto';
import { Event } from './entities/events.entity';
import { EventsQueries } from './events.queries';

@Injectable()
export class EventsService {
  SUBSCRIPTIONS = [];

  constructor(private eventsQueries: EventsQueries) {}

  /**
   * Handle Event
   * Save event to db, return matched subscriptions
   */
  async handleEvent(event: Event): Promise<string[]> {
    event.tags = JSON.stringify(event.tags);
    await this.eventsQueries.saveEvent(event);
    return this.fetchMatchedSubs(event);
  }

  /**
   * Handle Request
   * Save subscription & return events matched with req filter
   */
  async handleRequest(
    subscriptionId: string,
    filters: RequestFilterDto[],
  ): Promise<Event[]> {
    // If no subs exist save sub
    if (!this.SUBSCRIPTIONS.length) {
      this.SUBSCRIPTIONS.push([subscriptionId, filters]);
    }
    // If subs exist
    else {
      this.SUBSCRIPTIONS.forEach((sub) => {
        // If sub with Id doesn't exist, add sub
        // If sub with Id exists, replace sub filter(s) with new one(s)
        if (!sub[0].includes(subscriptionId))
          this.SUBSCRIPTIONS.push([subscriptionId, filters]);
        //
        else sub[1] = filters;
      });
    }

    // Return events matched with filters
    return this.eventsQueries.fetchEventsWithFilters(filters);
  }

  /**
   * Handle Close
   * Delete sub from subs on CLOSE event
   */
  handleClose(subscriptionId: string) {
    for (let i = 0; i < this.SUBSCRIPTIONS.length; i++) {
      if (this.SUBSCRIPTIONS[i][0] == subscriptionId)
        this.SUBSCRIPTIONS.splice(i, 1);
    }
  }

  /**
   * Fetch Matched Subs
   * Return subs with filters that would want this event
   */
  fetchMatchedSubs(event: Event): string[] {
    const matchedSubs = [];

    this.SUBSCRIPTIONS.forEach((sub) => {
      const subscriptionId: string = sub[0];
      const filters: RequestFilterDto[] = sub[1];

      filters.forEach((filter) => {
        if (
          filter.ids &&
          filter.ids.includes(event.id) &&
          filter.kinds &&
          filter.kinds.includes(event.kind) &&
          // filter.e &&
          // filter.e includes(event.tags.e) &&
          // filter.p &&
          // filter.p includes(event.tags.p) &&
          filter.since &&
          filter.since > parseInt(event.created_at) &&
          filter.until &&
          filter.until < parseInt(event.created_at) &&
          filter.authors &&
          filter.authors.includes(event.pubkey)
        ) {
          matchedSubs.push(subscriptionId);
          // break;
        }
      });
    });

    return matchedSubs;
  }
}
