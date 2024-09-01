import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

class Member {
  value: string;
}

export class CreateConversationDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsString()
  currentUserId?: string;

  @IsBoolean()
  isGroup?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => Member)
  members?: Member[];

  @IsString()
  name?: string;
}
