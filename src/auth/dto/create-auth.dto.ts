import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  login: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  //   @IsNotEmpty()
  //   @IsEmail()
  //   email: string;

  //   @IsEnum(Gender)
  //   gender: Gender;

  //   @IsString()
  //   profilePic: string;
}
