import { INestApplication } from '@nestjs/common';
import { EventsGateway } from 'src/modules/events/events.gateway';
import * as ws from 'ws';

const eventsGateway = new EventsGateway();

enum MessageType {
  EVENT = 'EVENT',
  REQ = 'REQ',
  CLOSE = 'CLOSE',
}

export function webSocketServerInit(app: INestApplication) {
  // Create websocket server by passing the http server instance
  const server = app.getHttpAdapter().getHttpServer();
  const wsServer = new ws.Server({ server });

  wsServer.on('connection', (socket) => {
    socket.on('message', (data) => {
      try {
        const message = JSON.parse(`${data}`);
        // EVENT
        if(message[0] == MessageType.EVENT) {
          eventsGateway.handleEvent(message[1]);
        }

        // REQ
        if(message[0] == MessageType.REQ) {
          const subscriptionId = message[1];
          const filters = [];
          for(let i = 2; i < message.length; i++) {
            filters.push(message[i]);
          }
          eventsGateway.handleRequest(subscriptionId, filters);
        }

        // CLOSE
        if(message[0] == MessageType.CLOSE) {
          eventsGateway.handleClose(message[1]);
        }
      }
      catch (error) {
        console.error(`Invalid message: ${error.message}`);
      }
    });
  });
}
