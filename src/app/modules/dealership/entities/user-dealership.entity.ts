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

export enum UserDealershipStatus {
  REQUESTED = 'REQUESTED',
  INREVIEW = 'INREVIEW',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
}
@Entity('user_role_dealerships')
export class UserDealership {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  user_id: number;

  @Column({ nullable: false })
  dealership_id: number;

  @Column({ type: 'bool', default: false })
  is_default: boolean;

  @Column({ type: 'int', nullable: true })
  role_id: number;

  @Column({
    type: 'enum',
    enum: UserDealershipStatus,
    default: UserDealershipStatus.REQUESTED,
  })
  status: UserDealershipStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(() => User, (user) => user.user_dealerships, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => Dealership, (dealership) => dealership.user_dealerships, {
    cascade: true,
    nullable: false,
  })
  @JoinColumn({ name: 'dealership_id' })
  dealership: Dealership;
}
