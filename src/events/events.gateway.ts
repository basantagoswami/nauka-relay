import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import { EventsService } from './events.service';
import { ErrorMessage } from 'src/utils/errors.util';
import { MessageType } from './enums/message-type.enum';
import { SharedService } from '../shared/shared.service';

@WebSocketGateway()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private eventsService: EventsService,
    private sharedService: SharedService,
  ) {}

  handleConnection(client: any, ...args: any[]) {
    client.on('message', async (data) => {
      let message;
      // Try to parse JSON, send error message if message isn't JSON
      try {
        message = JSON.parse(`${data}`);
      } catch (error) {
        client.send(
          this.sharedService.formatNotice(
            `${ErrorMessage.INVALID_JSON} ${error.message}`,
          ),
        );
      }

      // If message is JSON, and got successfully parsed
      if (message != undefined) {
        const messageType = message[0];
        switch (messageType) {
          // EVENT
          case MessageType.EVENT:
            this.eventsService.handleEvent(message[1]);
            break;
          // REQ
          case MessageType.REQ:
            const [, subscriptionId] = message.splice(0, 2);
            const events = await this.eventsService.handleRequest(
              subscriptionId,
              message,
            );
            events.forEach((event) => {
              event.tags = JSON.parse(event.tags);
              console.log(event.tags);
              client.send(
                this.sharedService.formatEvent(subscriptionId, event),
              );
            });
            break;
          case MessageType.CLOSE:
            this.eventsService.handleClose(message[1]);
        }
      }
    });
  }
  handleDisconnect(client: any) {
    console.log('Client disconnected');
  }
}
