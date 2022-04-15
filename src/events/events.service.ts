import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SharedService } from 'src/shared/shared.service';
import { Between, In, LessThan, MoreThan, Repository } from 'typeorm';
import { Event } from './entities/events.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepo: Repository<Event>,
    private sharedService: SharedService,
  ) {}

  /**
   * Save events to database if event is valid
   * @todo: check if events matches any subscription
   */
  async handleEvent(event: Event) {
    if (await this.sharedService.validateEvent(event)) {
      event.tags = JSON.stringify(event.tags);
      this.eventsRepo.save(event);
    }
  }

  /**
   * Return events based on the request filter
   * @todo: push subscription to a subscription object
   */
  async handleRequest(subscriptionId: string, filters: any[]) {
    return this.eventsRepo.find({
      where: this.createWhereClause(filters),
    });
  }

  handleClose(subscriptionId: string) {
    console.log(subscriptionId);
  }

  /**
   * Create the where clause that will fetch the appropriate events
   * @todo: find a more elegant solution ffs
   * @todo: also make the tags work, they are totally ignored for now
   */
  createWhereClause(filters: any[]) {
    const where = [];

    // For each filter create a where clause, which works as OR
    for (let i = 0; i < filters.length; i++) {
      const wherePerFilter = {};

      const { ids, kinds, e, p, since, until, authors } = filters[i];

      if (ids != undefined) {
        Object.assign(wherePerFilter, { id: In(ids) });
      }
      if (kinds != undefined) {
        Object.assign(wherePerFilter, { kind: In(kinds) });
      }
      // if (e != undefined) {
      // Object.assign(wherePerFilter, { tags.e: In(e) });
      // }
      // if (p != undefined) {
      // Object.assign(wherePerFilter, { tags.p In(p) })
      // }
      if (since != undefined) {
        Object.assign(wherePerFilter, { created_at: MoreThan(since) });
      }
      if (until != undefined) {
        Object.assign(wherePerFilter, { created_at: LessThan(since) });
      }
      if (since != undefined) {
        Object.assign(wherePerFilter, { created_at: Between(since, until) });
      }
      if (authors != undefined) {
        Object.assign(wherePerFilter, { pubkey: In(authors) });
      }

      where.push(wherePerFilter);
    }
    return where;
  }
}
