import { IsString } from 'class-validator';

export class AuthLoginInputDto{
  @IsString()
  email: string;

  @IsString()
  password: string;
}