import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  tipoUsuario: TipoUser;

  @Column()
  telefone: string;

  @Column({ unique: true })
  email: string;

  @Column()
  senha: string;

  @OneToMany(() => Enrollment, (enrollment  ) => enrollment.user)
  enrollments: Enrollment[];

}

type TipoUser = 'aluno' | 'professor' | 'admin';