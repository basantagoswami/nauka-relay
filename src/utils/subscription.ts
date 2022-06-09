import { RequestFilterDto } from 'src/events/dto/request-filter.dto';

export class Subscription {
  id: string;
  clientId: string;
  filters: RequestFilterDto[];
}
