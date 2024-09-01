import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { Conversation } from './entities/conversation.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetConversationsDto } from './dto/get-conversations.dto';

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateConversationDto): Promise<Conversation> {
    try {
      const conversation = await this.prisma.conversation.create({
        data: {
          name: dto.name,
          isGroup: dto.isGroup,
          users: {
            connect: [
              ...dto.members.map((member: { value: string }) => ({
                id: member.value
              })),
              {
                id: dto.userId
              }
            ]
          }
        },
        include: {
          users: true
        }
      });
      return new Conversation(conversation);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createDialog(dto: CreateConversationDto): Promise<Conversation> {
    try {
      const conversation = await this.prisma.conversation.create({
        data: {
          users: {
            connect: [
              {
                id: dto.currentUserId
              },
              {
                id: dto.userId
              }
            ]
          }
        },
        include: {
          users: true
        }
      });
      return new Conversation(conversation);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async find(dto: GetConversationsDto): Promise<Conversation[]> {
    try {
      const conversations = await this.prisma.conversation.findMany({
        where: {
          OR: [
            {
              userIds: {
                equals: [dto.currentUserId, dto.userId]
              }
            },
            {
              userIds: {
                equals: [dto.userId, dto.currentUserId]
              }
            }
          ]
        }
      });

      const mapConversations = conversations.map((conversation) => {
        return new Conversation(conversation);
      });

      return mapConversations;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
