import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

class Member {
  value: string;
}

export class CreateConversationDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsNotEmpty()
  @IsString()
  currentUserId: string;

  @IsOptional()
  @IsBoolean()
  isGroup?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => Member)
  members?: Member[];

  @IsOptional()
  @IsString()
  name?: string;
}
