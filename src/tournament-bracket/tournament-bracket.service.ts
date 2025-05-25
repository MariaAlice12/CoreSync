import { Injectable } from '@nestjs/common';
import { CreateTournamentBracketDto } from './dto/create-tournament-bracket.dto';
import { UpdateTournamentBracketDto } from './dto/update-tournament-bracket.dto';

@Injectable()
export class TournamentBracketService {
  private brackets = [];
  private idCounter = 1;

  create(dto: CreateTournamentBracketDto) {
    const newBracket = { id: this.idCounter++, ...dto };
    this.brackets.push(newBracket);
    return newBracket;
  }

  findAll() {
    return this.brackets;
  }

  findOne(id: number) {
    return this.brackets.find(b => b.id === id);
  }

  update(id: number, dto: UpdateTournamentBracketDto) {
    const index = this.brackets.findIndex(b => b.id === id);
    if (index === -1) return null;
    this.brackets[index] = { ...this.brackets[index], ...dto };
    return this.brackets[index];
  }

  remove(id: number) {
    const index = this.brackets.findIndex(b => b.id === id);
    if (index === -1) return null;
    const deleted = this.brackets.splice(index, 1);
    return deleted[0];
  }
}
