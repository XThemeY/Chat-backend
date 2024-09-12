import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { SocketModule } from 'src/socket/socket.module';
import { ConversationModule } from 'src/conversation/conversation.module';

@Module({
  imports: [SocketModule, ConversationModule],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService]
})
export class MessageModule {}
