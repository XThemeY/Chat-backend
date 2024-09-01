import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Conversation } from './entities/conversation.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ConversationService } from './conversation.service';
import { GetConversationsDto } from './dto/get-conversations.dto';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  async createConversation(@Body() dto: CreateConversationDto): Promise<Conversation> {
    let conversation: Conversation;
    if (dto.currentUserId) {
      conversation = await this.conversationService.createDialog(dto);
    } else {
      conversation = await this.conversationService.create(dto);
    }

    if (!conversation) {
      throw new BadRequestException('Error creating conversation');
    }
    return conversation;
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  async getConversations(@Body() dto: GetConversationsDto): Promise<Conversation[]> {
    const conversations = await this.conversationService.find(dto);
    return conversations;
  }
}
