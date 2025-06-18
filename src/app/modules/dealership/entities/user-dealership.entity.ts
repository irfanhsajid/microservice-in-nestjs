import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Dealership } from './dealerships.entity';

@Entity('user_dealerships')
export class UserDealership {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.user_dealerships)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => Dealership)
  @JoinColumn({ name: 'dealership_id' })
  dealership: Dealership;

  @Column({ type: 'bool', default: false })
  is_default: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
