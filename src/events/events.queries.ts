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
    });
    await this.eventsRepo.save(event);
  }

  /**
   * Fetch Events with Filters
   * Query db for events matched by request filter
   */
  async fetchEventsWithFilters(filters: RequestFilterDto[]): Promise<Event[]> {
    const qb = this.eventsRepo.createQueryBuilder('e');

    // For each filter in sub create a OR (...) clause
    // while filter values are AND
    filters.forEach((filter) => {
      const { ids, kinds, e, p, since, until, authors } = filter;

      qb.orWhere(
        new Brackets((q) => {
          if (ids) q.andWhere('e.id IN (:...ids)', { ids });
          if (kinds) q.andWhere('e.kind IN (:...kinds)', { kinds });
          // if (e) query.andWhere('e.tags.e IN (:...e)', { e });
          // if (p) query.andWhere('e.tags.p IN (:...p)', { p });
          if (since) q.andWhere('e.created_at > :since', { since });
          if (until) q.andWhere('e.created_at < :until', { until });
          if (authors) q.andWhere('e.pubkey IN (:...authors)', { authors });
        }),
      );
    });

    return qb.leftJoinAndSelect('e.tags', 'tags').getMany();
  }
}
