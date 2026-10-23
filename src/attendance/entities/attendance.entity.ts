import { Training } from 'src/training/entities/training.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';

// Confirmação de presença de um atleta em uma sessão (treino + dia).
@Entity()
@Unique('UQ_attendance_user_training_date', ['user', 'training', 'date'])
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Training, { onDelete: 'CASCADE' })
  training: Training;

  // YYYY-MM-DD
  @Column({ type: 'date' })
  date: string;

  @CreateDateColumn()
  createdAt: Date;
}
