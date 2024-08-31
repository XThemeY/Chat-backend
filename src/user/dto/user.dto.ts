import { User } from '@prisma/client';

export class UserDto {
  id: string;
  name: string;
  login: string;
  email: string;
  emailVerified: boolean;
  gender: string;
  image: string;
  conversationId: string[];
  seenMessageIds: string[];
  createdAt: Date;
  updatedAt: Date;
  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.login = user.login;
    this.email = user.email;
    this.emailVerified = user.emailVerified;
    this.gender = user.gender;
    this.image = user.image;
    this.conversationId = user.conversationId;
    this.seenMessageIds = user.seenMessageIds;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
