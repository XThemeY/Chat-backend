import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class UpdateConversationDto {
  @IsNotEmpty()
  @IsString()
  conversationId: string;

  @IsNotEmpty()
  @IsDateString()
  lastMessageAt: Date;

  @IsNotEmpty()
  @IsString()
  messageId: string;
}
