import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Training {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  modality: string;

  @Column()
  hour: string;

  @Column()
  address: string;

  @Column({ type: 'simple-array' })
  weekdays: string[];

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  active: boolean;

  @Column()
  maxStudents: number;

  @Column()
  minStudents: number;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.training)
  enrollments: Enrollment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
