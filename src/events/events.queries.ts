import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
import { EventDto } from './dto/event.dto';
import { RequestFilterDto } from './dto/request-filter.dto';
import { Event } from './entities/events.entity';
import { Pubkey } from './entities/pubkeys.entity';
import { Tag } from './entities/tags.entity';

@Injectable()
export class EventsQueries {
  constructor(
    @InjectRepository(Event)
    private eventsRepo: Repository<Event>,
    @InjectRepository(Pubkey)
    private pubkeysRepo: Repository<Pubkey>,
    @InjectRepository(Tag)
    private tagsRepo: Repository<Tag>,
  ) {}

  /**
   * Save event
   * Save event to db
   */
  async saveEvent(data: EventDto) {
    const { id, pubkey, created_at, kind, tags, content, sig } = data;

    // Upsert pubkey
    const existingPubkey = await this.pubkeysRepo.findOne({
      where: { value: pubkey },
    });
    const savedPubkey = await this.pubkeysRepo.save(
      existingPubkey || { value: pubkey },
    );

    // Upsert tags
    const savedTags = await Promise.all(
      tags.map(async (tag) => {
        console.log(tag);
        const existingTag = await this.tagsRepo.findOne({
          where: { type: tag[0], value: tag[1] },
        });
        console.log({ existingTag });
        const t = existingTag
          ? existingTag
          : await this.tagsRepo.save({
              type: tag[0],
              value: tag[1],
              recommended_relay_url: tag[2] ? tag[2] : null,
            });
        return t;
      }),
    );

    // Upsert event data, (save upserts because event's primary key is "id")
    await this.eventsRepo.save(
      this.eventsRepo.create({
        pubkey: savedPubkey,
        tags: savedTags,
        id,
        created_at,
        kind,
        content,
        sig,
      }),
    );
  }

  /**
   * Save metadata
   * Save metadata about a profile, if existing data, delete it
   */

  saveMetadata(event: EventDto) {
    // considering it is a metadata event
    const { name, about, picture } = JSON.parse(event.content);
    console.log({ name, about, picture });
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
      .leftJoinAndSelect('e.tags', 't')
      .leftJoinAndSelect('e.pubkey', 'p');

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
          if (e) q.andWhere('t.value IN (:...e)', { e });
          if (p) q.andWhere('t.value IN (:...p)', { p });
          if (since) q.andWhere('e.created_at > :since', { since });
          if (until) q.andWhere('e.created_at < :until', { until });
          if (authors) q.andWhere('p.value IN (:...authors)', { authors });
        }),
      );
    });

    // Only take limit from the first filter, ignore the others
    return qb.limit(filters[0]['limit'] || defaultLimit).getMany();
  }
}
