import { SetMetadata } from '@nestjs/common';
import { TipoUser } from 'src/user/entities/user.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: TipoUser[]) => SetMetadata(ROLES_KEY, roles);
