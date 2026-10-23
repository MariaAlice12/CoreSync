import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { TrainingModule } from 'src/training/training.module';
import { EnrollmentModule } from 'src/enrollment/enrollment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance]),
    TrainingModule,
    EnrollmentModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
