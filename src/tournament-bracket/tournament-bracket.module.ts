import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TournamentBracket } from './entities/tournament-bracket.entity';
import { TournamentBracketService } from './tournament-bracket.service';
import { TournamentBracketController } from './tournament-bracket.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TournamentBracket])],
  controllers: [TournamentBracketController],
  providers: [TournamentBracketService],
})
export class TournamentBracketModule {}
