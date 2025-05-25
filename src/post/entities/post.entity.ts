// src/post/entities/post.entity.ts

import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';
@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.enrollments, { eager: true })
  user: User;

  @CreateDateColumn()
  date: Date;

  @Column({ })
  description: string;
  
  @Column({ nullable: true })
  image: string;
  
}
