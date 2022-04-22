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
   * Save event to db, return matched subscriptions
   */
  async handleEvent(event: Event): Promise<string[]> {
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
    // If sub array is empty, push the first sub
    if (!this.SUBSCRIPTIONS.length) {
      this.SUBSCRIPTIONS.push([subscriptionId, filters]);
    }
    // If subs array isn't empty:
    // replace filters if sub already exists, else push new sub
    else {
      let subExists = false;
      this.SUBSCRIPTIONS.forEach((sub) => {
        if (sub[0] == subscriptionId) {
          subExists = true;
          sub[1] = filters;
        }
      });
      if (!subExists) this.SUBSCRIPTIONS.push([subscriptionId, filters]);
    }

    // Return events matched with filters
    const matchedEvents = await this.eventsQueries.fetchEventsWithFilters(
      filters,
    );
    const eventsToSend = [];

    matchedEvents.forEach((event) => {
      const tags = event.tags.map((tag) =>
        JSON.parse(`["${tag.name}", "${tag.tag}"]`),
      );

      // Format events before sending
      eventsToSend.push({
        id: event.id,
        pubkey: event.pubkey,
        created_at: event.created_at,
        kind: event.kind,
        tags: tags,
        content: event.content,
        sig: event.sig,
      });
    });
    return eventsToSend;
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
        const { ids, kinds, e, p, since, until, authors } = filter;
        // todo: implement fetching matched subs
      });
    });

    return matchedSubs;
  }
}
