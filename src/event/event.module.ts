import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { TournamentBracket } from 'src/tournament-bracket/entities/tournament-bracket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, TournamentBracket])],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
