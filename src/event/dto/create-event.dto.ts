import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEventDto {

    @ApiProperty({ type: String })
    title: string;

    @ApiProperty({ type: String })
    description: string;

    @ApiProperty({ type: String })
    image: string;

    @ApiProperty({ type: Date })
    date: Date;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    bracketGenerated?: boolean;

}
