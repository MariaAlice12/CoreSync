import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {

    @ApiProperty({ type: String })
    description: string;

    @ApiProperty({ type: String })
    image: string;

}
