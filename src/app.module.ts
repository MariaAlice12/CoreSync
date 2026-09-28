import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TrainingModule } from './training/training.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { EventModule } from './event/event.module';
import { TournamentBracketModule } from './tournament-bracket/tournament-bracket.module';
import { StravaModule } from './strava/strava.module';
import { EventRegistrationModule } from './event-registration/event-registration.module';
import { SurveyModule } from './survey/survey.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { dataSourceOptions } from './database/data-source';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    TypeOrmModule.forRoot(dataSourceOptions),
    TrainingModule,
    UserModule,
    EnrollmentModule,
    EventModule,
    TournamentBracketModule,
    StravaModule,
    EventRegistrationModule,
    SurveyModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
