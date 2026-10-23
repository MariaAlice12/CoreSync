import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, Matches } from 'class-validator';

export class CreateAttendanceDto {
  @ApiProperty({ type: Number })
  @IsInt()
  @IsPositive()
  trainingId: number;

  @ApiProperty({
    type: String,
    required: false,
    example: '2026-03-16',
    description: 'Dia da sessão (YYYY-MM-DD). Padrão: hoje',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date deve estar no formato YYYY-MM-DD',
  })
  date?: string;
}
