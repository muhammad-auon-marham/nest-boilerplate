import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { BaseGateway } from './base.gateway';

/**
 * Example gateway. Clients connect to the `/events` namespace and receive a `pong` for every `ping`.
 */
@WebSocketGateway({ namespace: 'events' })
export class EventsGateway extends BaseGateway {
  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: unknown): { event: string; data: unknown } {
    return { event: 'pong', data };
  }
}
