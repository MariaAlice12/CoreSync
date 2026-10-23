import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TipoUser, User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CurrentUserPayload } from 'src/auth/decorators/current-user.decorator';
export interface UserFilters {
    userType?: TipoUser;
    course?: string;
    shift?: string;
    campus?: string;
}
export declare class UserService {
    private userRepo;
    constructor(userRepo: Repository<User>);
    create(dto: CreateUserDto, currentUser?: CurrentUserPayload): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findAll(filters?: UserFilters): Promise<User[]>;
    findByIds(ids: number[]): Promise<User[]>;
    findIdsByType(userType: TipoUser): Promise<number[]>;
    findOne(id: number): Promise<User>;
    update(id: number, dto: UpdateUserDto, currentUser: CurrentUserPayload): Promise<User>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
