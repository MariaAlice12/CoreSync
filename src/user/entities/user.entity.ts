import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Post } from 'src/post/entities/post.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

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

  @Column()
  password: string;

  @OneToMany(() => Enrollment, (enrollment  ) => enrollment.user)
  enrollments: Enrollment[];

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[]

}

export type TipoUser = 'aluno' | 'professor' | 'admin';