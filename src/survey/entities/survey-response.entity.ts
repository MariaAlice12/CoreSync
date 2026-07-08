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
export class SurveyResponse {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Training, { eager: true })
  training: Training;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @CreateDateColumn()
  createdAt: Date;
}
