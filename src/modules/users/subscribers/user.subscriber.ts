import { Injectable, Logger } from '@nestjs/common';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { User } from '../entities/user.entity';

/**
 * Example TypeORM subscriber. Registers itself on the DataSource so Nest DI and entity events both work.
 * Never log PII (emails, names) here — ids only.
 */
@Injectable()
@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  private readonly logger = new Logger(UserSubscriber.name);

  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo(): typeof User {
    return User;
  }

  afterInsert(event: InsertEvent<User>): void {
    this.logger.debug(`User inserted: ${event.entity.id}`);
  }
}
