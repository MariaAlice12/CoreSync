import { IsInt, IsBoolean, IsPositive, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnrollmentDto {
  @ApiProperty({ type: Number })
  @IsInt()
  @IsPositive()
  trainingId: number;

  @ApiProperty({
    type: Number,
    required: false,
    description:
      'Ignorado para alunos (usa o usuário logado); admin/professor podem matricular outro aluno',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  userId?: number;

  @ApiProperty({ type: Boolean, default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
