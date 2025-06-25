import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Dealership } from './dealerships.entity';
import { Role } from '../../roles/entities/role.entity';

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

  @Column({ nullable: true })
  dealership_id: number;

  @Column({ type: 'bool', default: false })
  is_default: boolean;

  @Column({ type: 'int', nullable: false })
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

  @OneToOne(() => Role, (role) => role.users, { nullable: false })
  @JoinColumn({ name: 'role_id' })
  role: Role;

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
