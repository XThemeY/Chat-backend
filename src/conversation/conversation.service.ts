import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Conversation } from '@prisma/client';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateConversationDto): Promise<Conversation> {
    try {
      const conversation = await this.prisma.conversation.create({
        data: {
          name: dto.name,
          isGroup: true,
          users: {
            connect: [
              ...dto.members.map((member: { value: string }) => ({
                id: member.value
              })),
              {
                id: dto.currentUserId
              }
            ]
          }
        },
        include: {
          users: true
        }
      });

      return conversation;
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
      return conversation;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findDialog(currentUserId: string, userId: string): Promise<Conversation> {
    try {
      const conversation = await this.prisma.conversation.findFirst({
        where: {
          isGroup: false,
          users: {
            some: {
              id: currentUserId
            }
          },
          AND: {
            users: {
              none: {
                id: { notIn: [userId, currentUserId] }
              }
            }
          }
        },
        include: {
          users: true
        }
      });

      return conversation;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findConversations(userId: string): Promise<Conversation[]> {
    try {
      const conversations = await this.prisma.conversation.findMany({
        orderBy: {
          lastMessageAt: 'desc'
        },
        where: { users: { some: { id: userId } } },
        include: {
          users: true,
          messages: {
            include: {
              sender: true,
              seen: true
            }
          }
        }
      });

      return conversations;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findById(id: string): Promise<Conversation> {
    try {
      const conversation = await this.prisma.conversation.findUnique({
        where: {
          id: id
        },
        include: {
          users: true
        }
      });
      return conversation;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async update(data: UpdateConversationDto): Promise<Conversation> {
    try {
      const conversation = await this.prisma.conversation.update({
        where: {
          id: data.conversationId
        },
        data: {
          lastMessageAt: data.lastMessageAt,
          messages: {
            connect: {
              id: data.messageId
            }
          }
        },
        include: {
          users: true,
          messages: {
            include: {
              seen: true
            }
          }
        }
      });
      return conversation;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
