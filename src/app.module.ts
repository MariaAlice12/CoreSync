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

@Module({
  imports: [TypeOrmModule.forRoot({
      type: 'sqlite', // ou 'postgres', 'mysql'...
      database: 'db.sqlite',
      entities: [Training, User, Enrollment],
      synchronize: true, // ⚠️ Apenas pra desenvolvimento
    }),
    TrainingModule,
    UserModule,
    EnrollmentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
