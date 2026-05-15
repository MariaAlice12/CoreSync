import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @ApiProperty({ type: String, example: 'user@email.com' })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ type: String, example: '123456' })
  password: string;
}
