import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { TipoUser } from '../entities/user.entity';

export class CreateUserDto {
  @IsNotEmpty()
  @ApiProperty({ type: String })
  name: string;

  @IsEmail()
  @ApiProperty({ type: String })
  email: string;

  @MinLength(6)
  @ApiProperty({ type: String })
  password: string;

  @ApiProperty({ type: String })
  userType: TipoUser;

  @ApiProperty({ type: String })
  telephone: string;

}
