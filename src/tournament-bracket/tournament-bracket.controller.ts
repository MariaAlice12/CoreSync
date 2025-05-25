import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TournamentBracketService } from './tournament-bracket.service';
import { CreateTournamentBracketDto } from './dto/create-tournament-bracket.dto';
import { UpdateTournamentBracketDto } from './dto/update-tournament-bracket.dto';

@Controller('tournament-bracket')
export class TournamentBracketController {
  constructor(private readonly tournamentBracketService: TournamentBracketService  ) {}

  @Post()
  create(@Body() createTournamentBracketDto: CreateTournamentBracketDto) {
    return this.tournamentBracketService.create(createTournamentBracketDto);
  }

  @Get()
  findAll() {
    return this.tournamentBracketService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tournamentBracketService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTournamentBracketDto: UpdateTournamentBracketDto) {
    return this.tournamentBracketService.update(+id, updateTournamentBracketDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tournamentBracketService.remove(+id);
  }
}
