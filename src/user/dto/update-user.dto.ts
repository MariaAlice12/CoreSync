
import { ApiProperty } from '@nestjs/swagger';
import { TipoUser } from '../entities/user.entity';

export class UpdateUserDto {

    @ApiProperty({ type: String })
    name: string;

    @ApiProperty({ type: String })
    email: string;

    @ApiProperty({ type: String })
    password: string;

    @ApiProperty({ type: String })
    userType: TipoUser;

    @ApiProperty({ type: String })
    telephone: string;
}
