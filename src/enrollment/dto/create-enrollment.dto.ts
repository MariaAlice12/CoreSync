import { IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class CreateEnrollmentDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  treinoId: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
