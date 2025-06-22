// src/matricula/entities/matricula.entity.ts

import { Training } from 'src/training/entities/training.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
@Entity()
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.enrollments, { eager: true })
  user: User;

  @ManyToOne(() => Training, (training) => training.enrollments, { eager: true })
  training: Training;

  @CreateDateColumn()
  date: Date;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
