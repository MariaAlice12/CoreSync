// Carrega o .env antes de qualquer módulo: alguns (JwtModule, gateway de
// notificações) leem process.env no momento da importação.
import 'dotenv/config';
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
import { NotificationModule } from './notification/notification.module';
import { AttendanceModule } from './attendance/attendance.module';
import { PerformanceModule } from './performance/performance.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { LOCAL_UPLOAD_DIR } from './storage/storage.service';
import { dataSourceOptions } from './database/data-source';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Fotos enviadas sem S3 configurado ficam em ./uploads
    ServeStaticModule.forRoot({
      rootPath: LOCAL_UPLOAD_DIR,
      serveRoot: '/uploads',
      serveStaticOptions: { index: false },
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10 }]),
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
    NotificationModule,
    AttendanceModule,
    PerformanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
