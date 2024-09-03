import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateMessageDto {
  @IsOptional()
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  image: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => String)
  attachments: string[];

  @IsNotEmpty()
  @IsString()
  conversationId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;
}
