import { PartialType } from '@nestjs/mapped-types';
import { CreateTrainingDto } from './create-training.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTrainingDto extends PartialType(CreateTrainingDto) {

      @ApiProperty({ type: String })
      modality: string;

      @ApiProperty({ type: String })
      hour: string;

      @ApiProperty({ type: String })
      adress: string;

      @ApiProperty({ type: String })
      weekday: string;

      @ApiProperty({ type: String })
      description: string;

      @ApiProperty({ type: Boolean })
      atictive: boolean;

      @ApiProperty({ type: Number })
      maxStudents: number;

      @ApiProperty({ type: Number })
      minStudents: number;

}
