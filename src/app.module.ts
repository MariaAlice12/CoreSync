import { Module } from '@nestjs/common';
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

@Module({
  imports: [TypeOrmModule.forRoot({
      type: 'mysql', // ou 'postgres', 'mysql'...
      host: 'localhost',
      port: 3306,
      database: 'db',
      username: 'root',
      password: 'root',
      entities: [Training, User, Enrollment, Event, TournamentBracket],
      synchronize: true, // ⚠️ Apenas pra desenvolvimento
    }),
    TrainingModule,
    UserModule,
    EnrollmentModule,
    EventModule,
    TournamentBracketModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
