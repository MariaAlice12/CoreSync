import { Exclude } from 'class-transformer';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// Vínculo OAuth entre um usuário do CoreSync e a conta dele no Strava.
@Entity()
export class StravaAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column()
  athleteId: string;

  @Column({ type: 'varchar', nullable: true })
  athleteName: string | null;

  @Exclude()
  @Column()
  accessToken: string;

  @Exclude()
  @Column()
  refreshToken: string;

  // Epoch em segundos, como retornado pelo Strava
  @Column('int')
  expiresAt: number;

  @Column({ type: 'varchar', nullable: true })
  scope: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
