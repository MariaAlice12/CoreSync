import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Event } from './event.entity';

@Entity()
export class EventPhoto {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Event, (event) => event.photos, { onDelete: 'CASCADE' })
  event: Event;

  @ManyToOne(() => User, { eager: true, nullable: true, onDelete: 'SET NULL' })
  uploadedBy: User | null;

  @Column({ length: 512 })
  url: string;

  // Caminho do arquivo no storage (chave do S3 ou caminho relativo em ./uploads)
  @Column({ length: 512 })
  key: string;

  @CreateDateColumn()
  createdAt: Date;
}
