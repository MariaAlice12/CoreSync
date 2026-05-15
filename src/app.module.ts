import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TrainingModule } from './training/training.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Training } from './training/entities/training.entity';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { Enrollment } from './enrollment/entities/enrollment.entity';
import { EventModule } from './event/event.module';
import { Event } from './event/entities/event.entity';
import { TournamentBracketModule } from './tournament-bracket/tournament-bracket.module';
import { TournamentBracket } from './tournament-bracket/entities/tournament-bracket.entity';
import { StravaModule } from './strava/strava.module';
import { Strava } from './strava/entities/strava.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      database: process.env.DB_DATABASE || 'db',
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'root',
      entities: [Training, User, Enrollment, Event, TournamentBracket, Strava],
      synchronize: true,
    }),
    TrainingModule,
    UserModule,
    EnrollmentModule,
    EventModule,
    TournamentBracketModule,
    StravaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
