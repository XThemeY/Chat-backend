import { Conversation as PrismaConversation } from '@prisma/client';

export class Conversation {
  id: string;
  name: string;
  isGroup: boolean;
  messageIds: string[];
  createdAt: Date;
  constructor(conversation: PrismaConversation) {
    this.id = conversation.id;
    this.name = conversation.name;
    this.isGroup = conversation.isGroup;
    this.messageIds = conversation.messageIds;
    this.createdAt = conversation.createdAt;
  }
}
