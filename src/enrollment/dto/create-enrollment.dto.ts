import {
  IsInt,
  IsBoolean,
  IsPositive,
  IsOptional,
  IsIn,
} from 'class-validator';
import { NIVEIS_TREINO, NivelTreino } from 'src/common/niveis';
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

  @ApiProperty({
    enum: NIVEIS_TREINO,
    required: false,
    description:
      'Autoavaliação do atleta no esporte (não restringe a turma; insight para o professor)',
  })
  @IsOptional()
  @IsIn(NIVEIS_TREINO)
  selfLevel?: NivelTreino;
}
