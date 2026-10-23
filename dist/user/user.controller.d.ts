import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { UserService, UserFilters } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto, user?: CurrentUserPayload): Promise<import("./entities/user.entity").User>;
    findAll(filters: UserFilters): Promise<import("./entities/user.entity").User[]>;
    findOne(id: number): Promise<import("./entities/user.entity").User>;
    update(id: number, updateUserDto: UpdateUserDto, user: CurrentUserPayload): Promise<import("./entities/user.entity").User>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
