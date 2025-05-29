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
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.posts)
  user: User;

  @Column({ })
  title: string;

  @Column({ })
  description: string;
  
  @Column({ nullable: true })
  image: string;

  @CreateDateColumn()
  date: Date;
  
}
