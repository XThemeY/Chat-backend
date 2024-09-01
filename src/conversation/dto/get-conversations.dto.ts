import { IsNotEmpty, IsString } from 'class-validator';

export class GetConversationsDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  currentUserId: string;
}
