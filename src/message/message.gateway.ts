import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateMessageDto } from 'src/message/dto/create-message.dto';
import { MessageService } from 'src/message/message.service';

@WebSocketGateway()
export class MessageGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private messageService: MessageService) {}

  @WebSocketServer() server: Server;

  @SubscribeMessage('newMessage')
  async handleNewMessage(client: Socket, payload: CreateMessageDto): Promise<void> {
    client.on('connection', (socket) => {
      console.log('newMessage', payload);
      console.log(`socket ${socket.id} connected`);
    });
    //  await this.messageService.create(payload);
    //  this.server.emit('recieveMessage', payload);
  }

  afterInit(server: Server) {
    console.log('Server init');
  }

  handleConnection(client: Socket) {
    console.log('Connected: ', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Dosconnected: ', client.id);
  }
}
