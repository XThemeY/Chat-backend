import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  image: string;

  @IsOptional()
  @IsString()
  name?: string;
}
