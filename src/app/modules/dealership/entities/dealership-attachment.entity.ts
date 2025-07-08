import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Dealership } from './dealerships.entity';

@Entity('dealership_attachments')
export class DealershipAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  user_id: number;

  @Column({ nullable: false })
  dealership_id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  path: string;

  @Column({ type: 'int', nullable: true })
  size: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(() => Dealership, (dealership) => dealership.attachments, {
    nullable: false,
  })
  @JoinColumn({ name: 'dealership_id' })
  dealership: Dealership;

  @ManyToOne(() => User, (user) => user.attachments, {
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
