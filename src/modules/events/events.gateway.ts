import { Injectable } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway } from '@nestjs/websockets';
import { EventDto } from './dto/event.dto';
import { EventsService } from './events.service';

@WebSocketGateway()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect{
  constructor(
    private eventsService: EventsService
  ) {}

  handleConnection(client: any, ...args: any[]) {
    client.on('message', (data) =>  {
      try {
        const message = JSON.parse(`${data}`);
        // EVENT
        if(message[0] == MessageType.EVENT) {
          this.eventsService.handleEvent(message[1]);
        }

        // REQ
        if(message[0] == MessageType.REQ) {
          const subscriptionId = message[1];
          const filters = [];
          for(let i = 2; i < message.length; i++) {
            filters.push(message[i]);
          }
          this.eventsService.handleRequest(subscriptionId, filters);
        }

        // CLOSE
        if(message[0] == MessageType.CLOSE) {
          this.eventsService.handleClose(message[1]);
        }
      }
      catch (error) {
        console.error(`Invalid message: ${error.message}`);
      }
    })
  }
  handleDisconnect(client: any) {

  }
}
