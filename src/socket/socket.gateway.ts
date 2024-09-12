import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
@WebSocketGateway({
  cors: {
    origin: 'http://wasted-chat.ru',
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header'],
    credentials: true
  }
})
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(SocketGateway.name);
  @WebSocketServer() server: Server;
  clientsIds: Map<string, string> = new Map();
  afterInit() {
    console.log('SocketGateway init');
  }

  handleConnection(client: Socket, ...args: any[]) {
    const { sockets } = this.server.sockets;

    this.logger.log(`Client id: ${client.id} connected`);
    this.logger.debug(`Number of connected clients: ${sockets.size}`);
  }

  handleDisconnect(client: Socket) {
    const { sockets } = this.server.sockets;

    this.logger.log(`Client id: ${client.id} disconnected`);
    this.logger.debug(`Number of connected clients: ${sockets.size}`);
    if (this.clientsIds.has(client.id)) {
      const userId = this.clientsIds.get(client.id);
      this.clientsIds.delete(client.id);
      this.clientsIds.forEach((value, key) => {
        this.server.to(key).emit('app:member_removed', { id: userId });
      });
    }
  }

  @SubscribeMessage('subscribe')
  async subscribe(client: Socket, data: any) {
    if (data.room === 'presense-messenger') {
      if (!Array.from(this.clientsIds.values()).includes(data.userId)) {
        this.clientsIds.forEach((value, key) => {
          this.server.to(key).emit('app:member_added', { id: data.userId });
        });
        client.join(data.room);
      }
      const roomUsers = [];
      this.clientsIds.set(client.id, data.userId);
      this.clientsIds.forEach((value, key) => {
        roomUsers.push({ id: value });
      });

      this.server.to(client.id).emit('app:subscription_succeeded', roomUsers);
    } else {
      client.join(data.room);
    }
  }

  @SubscribeMessage('unsubscribe')
  unsubscribe(client: Socket, data: any) {
    client.leave(data.room);
  }
}
