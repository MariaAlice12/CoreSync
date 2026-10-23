import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { TipoUser, TURNOS, Turno } from '../entities/user.entity';

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

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false, description: 'Curso do aluno' })
  course?: string;

  @IsOptional()
  @IsIn(TURNOS)
  @ApiProperty({ type: String, enum: TURNOS, required: false })
  shift?: Turno;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    required: false,
    description: 'Campus / unidade',
  })
  campus?: string;
}
