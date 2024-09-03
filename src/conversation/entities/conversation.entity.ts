import { Message, Conversation as PrismaConversation, User } from '@prisma/client';

type ConversationPrisma = PrismaConversation & {
  messages?: (Message[] & { sender: User; seen: User[] })[];
  users: User[];
};
export class Conversation {
  id: string;
  name: string;
  isGroup: boolean;
  messageIds: string[];
  createdAt: Date;
  userIds: string[];
  users: User[];
  messages?: (Message[] & { sender: User; seen: User[] })[];
  constructor(conversation: ConversationPrisma) {
    this.id = conversation.id;
    this.name = conversation.name;
    this.isGroup = conversation.isGroup;
    this.createdAt = conversation.createdAt;
    this.users = conversation.users;
    this.messages = conversation.messages;
  }
}
