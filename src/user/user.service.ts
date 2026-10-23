import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TipoUser, Turno, User } from './entities/user.entity';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CurrentUserPayload } from 'src/auth/decorators/current-user.decorator';

export interface UserFilters {
  userType?: TipoUser;
  course?: string;
  shift?: string;
  campus?: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto, currentUser?: CurrentUserPayload) {
    // Cadastro público só cria aluno/professor; admins são criados por outro admin.
    if (dto.userType === 'admin' && currentUser?.userType !== 'admin') {
      throw new ForbiddenException(
        'Apenas administradores podem cadastrar outros administradores',
      );
    }
    if (await this.findByEmail(dto.email)) {
      throw new ConflictException('E-mail já cadastrado');
    }
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({ ...dto, password: hashed });
    return this.userRepo.save(user);
  }

  findByEmail(email: string) {
    return this.userRepo.findOneBy({ email });
  }

  findAll(filters: UserFilters = {}) {
    const where: FindOptionsWhere<User> = {};
    if (filters.userType) where.userType = filters.userType;
    if (filters.course) where.course = filters.course;
    if (filters.shift) where.shift = filters.shift as Turno;
    if (filters.campus) where.campus = filters.campus;
    return this.userRepo.find({ where, order: { name: 'ASC' } });
  }

  findByIds(ids: number[]) {
    if (ids.length === 0) return Promise.resolve([]);
    return this.userRepo.findBy({ id: In(ids) });
  }

  async findIdsByType(userType: TipoUser): Promise<number[]> {
    const users = await this.userRepo.find({
      select: { id: true },
      where: { userType },
    });
    return users.map((u) => u.id);
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException(`Usuário #${id} não encontrado`);
    return user;
  }

  async update(
    id: number,
    dto: UpdateUserDto,
    currentUser: CurrentUserPayload,
  ) {
    const isAdmin = currentUser.userType === 'admin';
    if (!isAdmin && currentUser.id !== id) {
      throw new ForbiddenException('Você só pode alterar o próprio perfil');
    }
    if (dto.userType !== undefined && !isAdmin) {
      throw new ForbiddenException(
        'Somente administradores podem alterar o tipo de usuário',
      );
    }

    const user = await this.findOne(id);
    if (
      dto.email &&
      dto.email !== user.email &&
      (await this.findByEmail(dto.email))
    ) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const changes: Partial<User> = { ...dto };
    if (dto.password) changes.password = await bcrypt.hash(dto.password, 10);
    Object.assign(user, changes);
    return this.userRepo.save(user);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.userRepo.delete(id);
  }
}
