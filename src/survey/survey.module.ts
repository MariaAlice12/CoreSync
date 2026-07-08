import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveyService } from './survey.service';
import { SurveyController } from './survey.controller';
import { SurveyResponse } from './entities/survey-response.entity';
import { TrainingModule } from 'src/training/training.module';
import { EnrollmentModule } from 'src/enrollment/enrollment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SurveyResponse]),
    TrainingModule,
    EnrollmentModule,
  ],
  controllers: [SurveyController],
  providers: [SurveyService],
  exports: [SurveyService],
})
export class SurveyModule {}
