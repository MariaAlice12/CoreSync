import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { NIVEIS_TREINO, NivelTreino } from 'src/common/niveis';

export class UpdateEnrollmentDto {
  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiProperty({
    enum: NIVEIS_TREINO,
    required: false,
    description: 'Atualiza a autoavaliação do atleta',
  })
  @IsOptional()
  @IsIn(NIVEIS_TREINO)
  selfLevel?: NivelTreino;
}
