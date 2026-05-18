import { Exclude } from 'class-transformer';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Event } from 'src/event/entities/event.entity';
import { EventRegistration } from 'src/event-registration/entities/event-registration.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  userType: TipoUser;

  @Column()
  telephone: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.user)
  enrollments: Enrollment[];

  @OneToMany(() => Event, (event) => event.user)
  events: Event[];

  @OneToMany(() => EventRegistration, (reg) => reg.user)
  eventRegistrations: EventRegistration[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export type TipoUser = 'aluno' | 'professor' | 'admin';
