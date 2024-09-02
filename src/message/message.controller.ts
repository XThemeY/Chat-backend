import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

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
  createConversation(@Body() dto: CreateMessageDto) {
    return this.messageService.create(dto);
  }
}
