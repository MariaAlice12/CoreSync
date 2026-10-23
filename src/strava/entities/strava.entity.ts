// src/strava/entities/strava.entity.ts
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity()
export class Strava {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  user: User | null;

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

  @Column('float', { nullable: true })
  averageHeartrate: number | null;

  @Column('float', { nullable: true })
  maxHeartrate: number | null;

  @Column('float', { nullable: true })
  averageCadence: number | null;

  @Column('timestamp')
  startDate: Date;

  @CreateDateColumn()
  createdAt: Date;
}
