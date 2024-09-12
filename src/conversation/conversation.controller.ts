import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  ValidationPipe
} from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ConversationService } from './conversation.service';
import { Conversation, Prisma, User } from '@prisma/client';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { QueryDto } from './dto/query-conversations.dto';
import { SocketGateway } from 'src/socket/socket.gateway';

@Controller('conversations')
export class ConversationController {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly socketGateway: SocketGateway
  ) {}

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  async createConversation(@Body() dto: CreateConversationDto): Promise<Conversation & { users: User[] }> {
    let conversation: Conversation & { users: User[] };

    if (dto.userId) {
      conversation = await this.conversationService.createDialog(dto);
    } else {
      conversation = await this.conversationService.create(dto);
    }

    if (!conversation) {
      throw new BadRequestException('Error creating conversation');
    }
    conversation.users.forEach((user) => {
      if (user.id) {
        this.socketGateway.server.to(user.id).emit('conversation:new', conversation);
      }
    });

    return conversation;
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getConversationById(
    @Param('id') id: string,
    @Query(new ValidationPipe({ transform: true })) query: QueryDto
  ): Promise<Conversation[]> {
    const conversation = await this.conversationService.findById(id, query);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return [conversation];
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  async getConversations(
    @Query('currentUserId') currentUserId: string,
    @Query('userId') userId: string
  ): Promise<Conversation[] | Conversation> {
    let conversations: Conversation[];

    if (userId) {
      conversations = await this.conversationService.findDialog(currentUserId, userId);
    } else {
      conversations = await this.conversationService.findConversations(currentUserId);
    }

    if (!conversations || conversations.length === 0) {
      return [];
    }
    return conversations;
  }

  @Patch('/')
  @HttpCode(HttpStatus.OK)
  async updateConversations(@Body() dto: UpdateConversationDto): Promise<Conversation> {
    const conversation = await this.conversationService.update(dto);
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    conversation.users.map((user) => {
      this.socketGateway.server
        .to(user.id)
        .emit('conversation:update', { id: conversation.id, messages: [lastMessage] });
    });

    return conversation;
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  async deleteConversations(
    @Param('id') conversationId: string,
    @Body('currentUserId') currentUserId: string
  ): Promise<Prisma.BatchPayload> {
    const conversation = await this.conversationService.findById(conversationId);
    conversation.users.forEach((user) => {
      this.socketGateway.server.to(user.id).emit('conversation:delete', conversation);
    });
    const ceonv = await this.conversationService.delete(conversationId, currentUserId);
    return ceonv;
  }
}
