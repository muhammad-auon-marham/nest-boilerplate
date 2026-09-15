import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

/**
 * WebSocket gateways. Import this module in `AppModule` to enable them.
 */
@Module({
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class GatewaysModule {}
