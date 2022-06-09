import { Injectable } from '@nestjs/common';
import { Subscription } from 'src/utils/subscription';
import { EventDto } from './dto/event.dto';
import { RequestFilterDto } from './dto/request-filter.dto';
import { EventKind } from './enums/event-kind';
import { EventsQueries } from './events.queries';

@Injectable()
export class EventsService {
  subscriptions: Subscription[] = [];

  constructor(private eventsQueries: EventsQueries) {}

  /**
   * Handle Event
   * Save event to database or delete event
   */
  async handleEvent(event: EventDto) {
    switch (event.kind) {
      case EventKind.set_metadata:
        await this.eventsQueries.saveMetadata(event);
        break;
      case EventKind.text_note:
      case EventKind.recommend_server:
      case EventKind.encrypted_direct_message:
        await this.eventsQueries.saveEvent(event);
        break;
      case EventKind.deletion:
        console.log('Event deletion is yet to be implemented');
      default:
        console.log('Other event kinds are skipped for now');
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
  ): Promise<EventDto[]> {
    // If sub array is empty, push the first sub
    if (!this.subscriptions.length) {
      this.subscriptions.push({ id: subscriptionId, clientId, filters });
    }
    // If subs array isn't empty:
    // replace filters if sub already exists, else push new sub
    else {
      let subExists = false;
      this.subscriptions.forEach((sub) => {
        if (sub.id == subscriptionId && sub.clientId == clientId) {
          subExists = true;
          sub.clientId = clientId;
          sub.filters = filters;
        }
      });
      if (!subExists)
        this.subscriptions.push({ id: subscriptionId, clientId, filters });
    }

    // Return events matched with filters
    const matchedEvents = await this.eventsQueries.fetchEventsWithFilters(
      filters,
    );

    return matchedEvents.map((event) => {
      const tags = event.tags.map((tag) =>
        JSON.parse(`["${tag.type}", "${tag.value}"]`),
      );
      return {
        id: event.id,
        pubkey: event.pubkey.value,
        created_at: event.created_at,
        kind: event.kind,
        tags,
        content: event.content,
        sig: event.sig,
      };
    });
  }

  /**
   * Handle Close
   * Delete sub from subs on CLOSE event
   */
  handleClose(subscriptionId: string, clientId: string) {
    for (let i = 0; i < this.subscriptions.length; i++) {
      if (
        this.subscriptions[i].id == subscriptionId &&
        this.subscriptions[i].clientId == clientId
      )
        this.subscriptions.splice(i, 1);
    }
  }

  /**
   * Fetch Matched Subs
   * Return subs with filters that would want this event
   */
  fetchMatchedSubs(event: EventDto): Set<string> {
    // real ugly... but it works
    const matchedSubs = [];
    const { id, pubkey, created_at, kind, tags } = event;

    this.subscriptions.forEach((subscription) => {
      subscription.filters.forEach((filter) => {
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
                if (tag[0] == 'e') if (value.includes(tag[1])) matches++;
              });
              break;
            case '#p':
              tags.forEach((tag) => {
                if (tag[0] == 'p') if (value.includes(tag[1])) matches++;
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
