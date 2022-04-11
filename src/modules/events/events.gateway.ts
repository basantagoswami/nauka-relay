import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import { EventsService } from './events.service';
import { ErrorMessage } from 'src/utils/errors.util';
import { MessageType } from './enums/message-type.enum';

@WebSocketGateway()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private eventsService: EventsService) {}

  handleConnection(client: any, ...args: any[]) {
    client.on('message', (data) => {
      let message;
      try {
        message = JSON.parse(`${data}`);

        // EVENT
        if (message[0] == MessageType.EVENT) {
          this.eventsService.handleEvent(message[1]);
        }
        // REQ
        if (message[0] == MessageType.REQ) {
          const subscriptionId = message[1];
          const filters = [];
          for (let i = 2; i < message.length; i++) {
            filters.push(message[i]);
          }
          this.eventsService.handleRequest(subscriptionId, filters);
        }
        // CLOSE
        if (message[0] == MessageType.CLOSE) {
          this.eventsService.handleClose(message[1]);
        }
      } catch (error) {
        client.send(
          `["NOTICE", ${ErrorMessage.INVALID_JSON} ${error.message}]`,
        );
      }
    });
  }
  handleDisconnect(client: any) {}
}
