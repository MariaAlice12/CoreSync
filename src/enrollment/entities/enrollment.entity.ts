// src/matricula/entities/matricula.entity.ts

import { Training } from 'src/training/entities/training.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';
@Entity()
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.enrollments, { eager: true })
  user: User;

  @ManyToOne(() => Training, (training) => training.enrollments, { eager: true })
  training: Training;

  @CreateDateColumn()
  enrollDate: Date;

  @Column({ default: true })
  active: boolean;
}
