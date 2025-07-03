import { TipoUser } from '../entities/user.entity';
export declare class UpdateUserDto {
    name: string;
    email: string;
    password: string;
    userType: TipoUser;
    telephone: string;
}
