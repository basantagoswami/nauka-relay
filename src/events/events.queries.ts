import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { RequestFilterDto } from './dto/request-filter.dto';
import { Event } from './entities/events.entity';

@Injectable()
export class EventsQueries {
  constructor(
    @InjectRepository(Event)
    private eventsRepo: Repository<Event>,
  ) {}

  /**
   * Save event
   * Save event to db
   */
  async saveEvent(event: Event) {
    event.tags.forEach((tag) => {
      tag.name = tag[0];
      tag.tag = tag[1];
      tag.recommended_relay_url = tag[2];
    });
    await this.eventsRepo.save(event);
  }

  /**
   * Fetch Events with Filters
   * Query db for events matched by request filter
   */
  async fetchEventsWithFilters(filters: RequestFilterDto[]): Promise<Event[]> {
    // Maximum # of events to be send per request (if limit isn't present in filter)
    const defaultLimit = 500;

    const qb = this.eventsRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.tags', 't');

    // For each filter in sub create a OR (...) clause
    // while filter values are AND
    filters.forEach((filter) => {
      const { ids, kinds, since, until, authors } = filter;
      const e = filter['#e'];
      const p = filter['#p'];

      qb.orWhere(
        new Brackets((q) => {
          if (ids) q.andWhere('e.id IN (:...ids)', { ids });
          if (kinds) q.andWhere('e.kind IN (:...kinds)', { kinds });
          if (e) q.andWhere('t.tag IN (:...e)', { e });
          if (p) q.andWhere('t.tag IN (:...p)', { p });
          if (since) q.andWhere('e.created_at > :since', { since });
          if (until) q.andWhere('e.created_at < :until', { until });
          if (authors) q.andWhere('e.pubkey IN (:...authors)', { authors });
        }),
      );
    });

    // Only take limit from the first filter, ignore the others
    qb.limit(filters[0]['limit'] || defaultLimit);
    return qb.leftJoinAndSelect('e.tags', 'tags').getMany();
  }
}
