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
import { PostModule } from './post/post.module';
import { Post } from './post/entities/post.entity';
import { TournamentBracketModule } from './tournament-bracket/tournament-bracket.module';
import { TournamentBracket } from './tournament-bracket/entities/tournament-bracket.entity';

@Module({
  imports: [TypeOrmModule.forRoot({
      type: 'sqlite', // ou 'postgres', 'mysql'...
      database: 'db.sqlite',
      entities: [Training, User, Enrollment, Post, TournamentBracket],
      synchronize: true, // ⚠️ Apenas pra desenvolvimento
    }),
    TrainingModule,
    UserModule,
    EnrollmentModule,
    PostModule,
    TournamentBracketModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
