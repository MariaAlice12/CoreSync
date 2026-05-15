import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TournamentBracket } from './entities/tournament-bracket.entity';
import { CreateTournamentBracketDto } from './dto/create-tournament-bracket.dto';
import { UpdateTournamentBracketDto } from './dto/update-tournament-bracket.dto';

@Injectable()
export class TournamentBracketService {
  constructor(
    @InjectRepository(TournamentBracket)
    private readonly bracketRepo: Repository<TournamentBracket>,
  ) {}

  create(dto: CreateTournamentBracketDto) {
    const bracket = this.bracketRepo.create(dto);
    return this.bracketRepo.save(bracket);
  }

  findAll() {
    return this.bracketRepo.find();
  }

  async findOne(id: string) {
    const bracket = await this.bracketRepo.findOneBy({ id });
    if (!bracket) throw new NotFoundException(`Chave #${id} não encontrada`);
    return bracket;
  }

  async update(id: string, dto: UpdateTournamentBracketDto) {
    await this.findOne(id);
    return this.bracketRepo.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.bracketRepo.delete(id);
  }
}
