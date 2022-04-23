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
import { WebSocket, Server } from 'ws';

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
    client.on('message', (data) => {
      this.handleMessage(client, data);
    });
  }

  /**
   * Handle Disconnect
   * Gets called every time a connected client disconnects
   */
  handleDisconnect(client: any) {
    console.log('Client disconnected');
  }

  /**
   * Handle Message
   * Gets called every time a message is recieved from a client
   */
  async handleMessage(client: WebSocket, data: any) {
    let message: any;

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
        /**
         * EVENT
         * If event is valid, then it gets saved
         * then it's sent to clients who have subscriptions with filters
         * that would want that event
         */
        case MessageType.EVENT:
          const event = message[1];
          if (await this.sharedService.validateEvent(event)) {
            await this.eventsService.handleEvent(event);

            // Fetch matched subscription ids
            const matchedSubs = this.eventsService.fetchMatchedSubs(event);
            // Send event to clients with those subscription ids
            this.server.clients.forEach((client) => {
              if (client['subscriptionId'])
                if (matchedSubs.has(client['subscriptionId']))
                  client.send(
                    this.sharedService.formatEvent(
                      client['subscriptionId'],
                      event,
                    ),
                  );
            });
          } else
            client.send(
              this.sharedService.formatNotice(`${ErrorMessage.INVALID_EVENT}`),
            );
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
            message,
          );
          events.forEach((event) => {
            client.send(this.sharedService.formatEvent(subscriptionId, event));
          });
          break;
        /**
         * CLOSE
         */
        case MessageType.CLOSE:
          this.eventsService.handleClose(message[1]);
      }
    }
  }
}
