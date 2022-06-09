import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { EventsService } from './events.service';
import { ErrorMessage } from 'src/utils/error-message.util';
import { MessageType } from './enums/message-type.enum';
import { SharedService } from '../shared/shared.service';
import { WebSocket, Server, RawData } from 'ws';
import { v4 as uuid } from 'uuid';
import { EventDto } from './dto/event.dto';

@WebSocketGateway()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private eventsService: EventsService,
    private sharedService: SharedService,
  ) {}

  /**
   * Handle Connection
   * Gets called every time a new client connects to WS server
   */

  handleConnection(client: WebSocket, ...args: any[]) {
    // Save an unique id in the client object
    Object.assign(client, { id: uuid() });

    // Handle all kinds of messages, or send back all kinds of error messages
    client.on('message', async (data) => {
      await this.handleMessage(client, data).catch((error) => {
        client.send(
          this.sharedService.formatNotice(`An error occured: ${error.message}`),
        );
      });
    });
  }

  /**
   * Handle Disconnect
   * Gets called every time a connected client disconnects
   */
  handleDisconnect(client: WebSocket) {
    console.log(`Client ${client['id']} disconnected`);
  }

  /**
   * Handle Message
   * Gets called every time a message is recieved from a client
   */
  async handleMessage(client: WebSocket, data: RawData) {
    let message: any;

    // Try to parse JSON, send error message if message isn't JSON
    try {
      message = JSON.parse(`${data}`);
    } catch (error) {
      client.send(
        this.sharedService.formatNotice(
          `${ErrorMessage.INVALID_DATA} ${error.message}`,
        ),
      );
    }

    // If message is JSON, and got successfully parsed
    if (message != undefined) {
      const messageType: MessageType = message[0];

      switch (messageType) {
        /**
         * EVENT
         * If event is valid, then it gets saved
         * then it's sent to clients who have subscriptions with filters
         * that would want that event
         */
        case MessageType.EVENT:
          const event: EventDto = message[1];
          // Send error if event is invalid
          if (!(await this.sharedService.validateEvent(event))) {
            client.send(
              this.sharedService.formatNotice(`${ErrorMessage.INVALID_EVENT}`),
            );
          }
          //
          else {
            await this.eventsService.handleEvent(event);

            // Fetch matched subscription ids
            const matchedSubs = this.eventsService.fetchMatchedSubs(event);
            // Send event to clients with those subscription ids
            this.server.clients.forEach((client) => {
              if (client['subscriptionId'] && client['id']) {
                matchedSubs.forEach((sub) => {
                  if (
                    sub[0] == client['subscriptionId'] &&
                    sub[1] == client['id']
                  ) {
                    client.send(
                      this.sharedService.formatEvent(
                        client['subscriptionId'],
                        event,
                      ),
                    );
                  }
                });
              }
            });
          }
          break;
        /**
         * REQ
         */
        case MessageType.REQ:
          const [, subscriptionId] = message.splice(0, 2);

          // Save the subscriptionId in the client object
          Object.assign(client, { subscriptionId: subscriptionId });

          // Return requested events
          const events = await this.eventsService.handleRequest(
            subscriptionId,
            client['id'],
            message, // All the filters
          );
          events.forEach((event) => {
            client.send(this.sharedService.formatEvent(subscriptionId, event));
          });
          break;
        /**
         * CLOSE
         */
        case MessageType.CLOSE:
          this.eventsService.handleClose(message[1], client['id']);
          break;

        /**
         * All other kinds of messages
         * Even if they are JSON, will be rejected
         */
        default:
          client.send(
            this.sharedService.formatNotice(
              `${ErrorMessage.INVALID_MESSAGE_TYPE}`,
            ),
          );
      }
    }
  }
}
