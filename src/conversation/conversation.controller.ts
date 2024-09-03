import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query
} from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ConversationService } from './conversation.service';
import { Conversation } from '@prisma/client';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  async createConversation(@Body() dto: CreateConversationDto): Promise<Conversation> {
    let conversation: Conversation;

    if (dto.userId) {
      conversation = await this.conversationService.createDialog(dto);
    } else {
      conversation = await this.conversationService.create(dto);
    }

    if (!conversation) {
      throw new BadRequestException('Error creating conversation');
    }
    return conversation;
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getConversationById(@Param('id') id: string): Promise<Conversation> {
    const conversation = await this.conversationService.findById(id);
    if (!conversation) {
      throw new BadRequestException('Conversation not found');
    }
    return conversation;
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  async getConversations(
    @Query('currentUserId') currentUserId: string,
    @Query('userId') userId: string
  ): Promise<Conversation[] | Conversation> {
    let conversations: Conversation[] | Conversation;

    if (userId) {
      conversations = await this.conversationService.findDialog(currentUserId, userId);
    } else {
      conversations = await this.conversationService.findConversations(currentUserId);
    }

    if (!conversations) {
      return [];
    }
    return conversations;
  }

  @Patch('/')
  @HttpCode(HttpStatus.OK)
  async updateConversations(@Body() dto: UpdateConversationDto): Promise<Conversation> {
    const conversation = await this.conversationService.update(dto);
    return conversation;
  }
}
