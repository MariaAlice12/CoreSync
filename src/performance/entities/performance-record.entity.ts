import { Attendance } from 'src/attendance/entities/attendance.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit?: string;
}

// Desempenho de um atleta em uma sessão de treino, registrado pelo professor.
// Complementa o Strava em modalidades sem GPS (vôlei, futsal, basquete...).
@Entity()
export class PerformanceRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Attendance, { onDelete: 'CASCADE' })
  @JoinColumn()
  attendance: Attendance;

  // Nota de 1 a 5
  @Column('int', { nullable: true })
  rating: number | null;

  @Column('text', { nullable: true })
  notes: string | null;

  @Column('simple-json', { nullable: true })
  metrics: PerformanceMetric[] | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  recordedBy: User | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
