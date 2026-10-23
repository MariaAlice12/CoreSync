import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { EventPhoto } from './entities/event-photo.entity';
import { TournamentBracket } from 'src/tournament-bracket/entities/tournament-bracket.entity';
import { EventRegistration } from 'src/event-registration/entities/event-registration.entity';
import { UserModule } from 'src/user/user.module';
import { NotificationModule } from 'src/notification/notification.module';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      EventPhoto,
      TournamentBracket,
      EventRegistration,
    ]),
    UserModule,
    NotificationModule,
    StorageModule,
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
