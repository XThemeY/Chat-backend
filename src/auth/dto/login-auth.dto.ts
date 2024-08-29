import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginAuthDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  login: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  provider: string;

  @IsOptional()
  @IsString()
  providerAccountId: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  image: string;
}
