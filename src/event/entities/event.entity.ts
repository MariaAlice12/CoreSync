// src/event/entities/event.entity.ts

import { User } from 'src/user/entities/user.entity';
import { TournamentBracket } from 'src/tournament-bracket/entities/tournament-bracket.entity';
import { EventRegistration } from 'src/event-registration/entities/event-registration.entity';
import { EventPhoto } from './event-photo.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
  Column,
  JoinColumn,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.events, { eager: true })
  user: User;

  @ManyToMany(() => User, { eager: true })
  @JoinTable({
    name: 'event_organizers',
    joinColumn: { name: 'eventId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  organizers: User[];

  @OneToMany(() => EventRegistration, (reg) => reg.event)
  registrations: EventRegistration[];

  @OneToMany(() => EventPhoto, (photo) => photo.event)
  photos: EventPhoto[];

  @Column({})
  title: string;

  @Column({})
  description: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  date: Date;

  @Column({ type: 'varchar', nullable: true })
  location: string | null;

  @ManyToOne(() => TournamentBracket, {
    nullable: true,
    cascade: true,
    eager: true,
  })
  @JoinColumn({ name: 'tournamentBracketId' })
  tournamentBracket: TournamentBracket;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
