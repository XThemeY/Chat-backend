import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { SocketGateway } from 'src/socket/socket.gateway';
import { ConversationService } from 'src/conversation/conversation.service';

@Controller('messages')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly conversationService: ConversationService,
    private readonly socketGateway: SocketGateway
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get('/:conversationId')
  async getMessages(@Param('conversationId') conversationId: string) {
    const messages = await this.messageService.findByConversationId(conversationId);

    if (!messages) {
      throw new BadRequestException('Messages not found');
    }
    return messages;
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('/')
  async createMessage(@Body() dto: CreateMessageDto) {
    const newMessage = await this.messageService.create(dto);
    this.socketGateway.server.to(dto.conversationId).emit('message:new', newMessage);
    return newMessage;
  }

  @HttpCode(HttpStatus.OK)
  @Patch('/:id')
  async update(@Param('id') lastMessageId: string, @Body() dto: UpdateMessageDto) {
    const updatedMessage = await this.messageService.update(lastMessageId, dto);
    this.socketGateway.server
      .to(dto.currentUserId)
      .emit('conversation:update', { id: updatedMessage.conversationId, messages: [updatedMessage] });

    this.socketGateway.server.to(updatedMessage.conversationId).emit('message:update', updatedMessage);
    return updatedMessage;
  }
}
