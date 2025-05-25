// src/treino/entities/treino.entity.ts

import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class Training {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  modality: string;

  @Column()
  hour: string;

  @Column()
  adress: string;

  @Column()
  weekday: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  atictive: boolean;

  @Column()
  maxStudents: number;

  @Column()
  minStudents: number;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.training)
  enrollments: Enrollment[];


}
