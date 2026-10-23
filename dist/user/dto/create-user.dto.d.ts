import { TipoUser, Turno } from '../entities/user.entity';
export declare class CreateUserDto {
    name: string;
    email: string;
    password: string;
    userType: TipoUser;
    telephone: string;
    course?: string;
    shift?: Turno;
    campus?: string;
}
