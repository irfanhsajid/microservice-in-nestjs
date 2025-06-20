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
import { Role } from '../../role-management/entities/role.entity';
import { User } from '../../user/entities/user.entity';
import { Dealership } from './dealerships.entity';

@Entity('user_role_dealerships')
export class UserDealership {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.user_dealerships, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => Dealership, (dealership) => dealership.user_dealerships, {
    cascade: true,
    nullable: false,
  })
  @JoinColumn({ name: 'dealership_id' })
  dealership: Dealership;

  @Column({ type: 'bool', default: false })
  is_default: boolean;

  // added role_id to make the relationship with the role table
  @ManyToOne(() => Role, (role) => role.user_roles, { nullable: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
