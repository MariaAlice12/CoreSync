// src/strava/strava.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Strava } from './entities/strava.entity';
import { StravaAccount } from './entities/strava-account.entity';
import { StravaService } from './strava.service';
import { StravaController } from './strava.controller';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    HttpModule,
    AuthModule,
    TypeOrmModule.forFeature([Strava, StravaAccount]),
  ],
  controllers: [StravaController],
  providers: [StravaService],
  exports: [StravaService],
})
export class StravaModule {}
