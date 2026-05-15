import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsString, MinLength } from 'class-validator';
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

  @IsString()
  @IsIn(['aluno', 'professor', 'admin'])
  @ApiProperty({ type: String, enum: ['aluno', 'professor', 'admin'] })
  userType: TipoUser;

  @IsNotEmpty()
  @ApiProperty({ type: String })
  telephone: string;
}
