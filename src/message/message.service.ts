import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Message } from '@prisma/client';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async findByConversationId(conversationId: string): Promise<Message[]> {
    try {
      const messages = await this.prisma.message.findMany({
        where: {
          conversationId: conversationId
        },
        include: {
          sender: true,
          seen: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      });
      return messages;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async create(data: CreateMessageDto): Promise<Message> {
    try {
      const message = await this.prisma.message.create({
        data: {
          body: data.message,
          image: data.image,
          attachments: data.attachments || [],
          conversation: {
            connect: {
              id: data.conversationId
            }
          },
          sender: {
            connect: {
              id: data.userId
            }
          },
          seen: {
            connect: {
              id: data.userId
            }
          }
        },
        include: {
          seen: true,
          sender: true
        }
      });

      // await this.prisma.user.update({
      //   where: {
      //     id: data.userId
      //   },
      //   data: {
      //     id: data.userId,
      //     seenMessageIds: {
      //       push: message.id
      //     }
      //   }
      // });

      return message;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
