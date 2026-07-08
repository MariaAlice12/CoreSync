import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { Training } from './entities/training.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { CurrentUserPayload } from 'src/auth/decorators/current-user.decorator';

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(Training)
    private trainingRepo: Repository<Training>,
    private readonly userService: UserService,
  ) {}

  private async resolveProfessor(professorId: number) {
    const professor = await this.userService.findOne(professorId);
    if (professor.userType !== 'professor') {
      throw new BadRequestException(
        `Usuário #${professorId} não é um professor`,
      );
    }
    return professor;
  }

  async create(dto: CreateTrainingDto, currentUser: CurrentUserPayload) {
    const { professorId, ...rest } = dto;

    if (currentUser.userType === 'aluno') {
      throw new ForbiddenException(
        'Alunos não podem criar treinos',
      );
    }

    let professor;
    if (currentUser.userType === 'professor') {
      professor = await this.userService.findOne(currentUser.id);
    } else {
      // admin
      if (!professorId) {
        throw new BadRequestException(
          'professorId é obrigatório quando o treino é criado por um admin',
        );
      }
      professor = await this.resolveProfessor(professorId);
    }

    const training = this.trainingRepo.create({ ...rest, professor });
    return this.trainingRepo.save(training);
  }

  findAll() {
    return this.trainingRepo.find();
  }

  async findOne(id: number) {
    const training = await this.trainingRepo.findOneBy({ id });
    if (!training) throw new NotFoundException(`Treino #${id} não encontrado`);
    return training;
  }

  async update(
    id: number,
    dto: UpdateTrainingDto,
    currentUser: CurrentUserPayload,
  ) {
    const training = await this.findOne(id);
    const { professorId, ...rest } = dto;

    if (professorId !== undefined) {
      if (currentUser.userType !== 'admin') {
        throw new ForbiddenException(
          'Somente admins podem reatribuir o professor de um treino',
        );
      }
      training.professor = await this.resolveProfessor(professorId);
    }

    Object.assign(training, rest);
    return this.trainingRepo.save(training);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.trainingRepo.delete(id);
  }
}
