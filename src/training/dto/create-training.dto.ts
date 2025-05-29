import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class CreateTrainingDto {

     @ApiProperty({ type: String })
      @IsNotEmpty()
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
