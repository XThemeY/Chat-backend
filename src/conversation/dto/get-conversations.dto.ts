import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetConversationsDto {
  @IsOptional()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  currentUserId: string;
}
