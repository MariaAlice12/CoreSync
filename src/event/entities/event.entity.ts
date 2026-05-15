// src/event/entities/event.entity.ts

import { User } from 'src/user/entities/user.entity';
import { TournamentBracket } from 'src/tournament-bracket/entities/tournament-bracket.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.events)
  user: User;

  @Column({})
  title: string;

  @Column({})
  description: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  date: Date;

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
