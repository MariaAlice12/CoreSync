// src/strava/entities/strava.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Strava {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  stravaId: string;

  @Column()
  name: string;

  @Column('float')
  distance: number;

  @Column('int')
  movingTime: number;

  @Column('int')
  elapsedTime: number;

  @Column('float')
  totalElevationGain: number;

  @Column()
  type: string;

  @Column({ nullable: true })
  sportType: string;

  @Column('float', { nullable: true })
  averageSpeed: number;

  @Column('float', { nullable: true })
  maxSpeed: number;

  @Column('timestamp')
  startDate: Date;

  @CreateDateColumn()
  createdAt: Date;
}
