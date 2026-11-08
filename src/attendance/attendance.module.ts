import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { TrainingModule } from 'src/training/training.module';
import { EnrollmentModule } from 'src/enrollment/enrollment.module';
import { Strava } from 'src/strava/entities/strava.entity';
import { PerformanceRecord } from 'src/performance/entities/performance-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance, Strava, PerformanceRecord]),
    TrainingModule,
    EnrollmentModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
