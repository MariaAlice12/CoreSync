import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Training } from 'src/training/entities/training.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { SurveyResponse } from 'src/survey/entities/survey-response.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Training, Enrollment, SurveyResponse]),
    UserModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
