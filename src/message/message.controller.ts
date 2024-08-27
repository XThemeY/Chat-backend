import { Controller, Get, Post, Body } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  //   @Get('/conversations')
  //   getConversation() {
  //     return this.messageService.get();
  //   }

  //   @Post('/conversations')
  //   createConversation(@Body() createConversationDto: CreateConversationDto) {
  //     return this.messageService.create(createConversationDto);
  //   }
}
