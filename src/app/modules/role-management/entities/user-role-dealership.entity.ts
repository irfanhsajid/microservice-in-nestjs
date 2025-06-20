import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Dealership } from '../../dealership/entities/dealerships.entity';
import { User } from '../../user/entities/user.entity';
import { Role } from './role.entity';

@Entity('user_role_dealership')
export class UserRoleDealership {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'integer', nullable: false })
  user_id: number;

  @Column({ type: 'integer', nullable: false })
  role_id: number;

  @Column({ type: 'integer', nullable: false })
  dealership_id: number;

  @ManyToOne(() => User, (user) => user.user_dealerships)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Role, (role) => role.user_roles)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Dealership, (dealership) => dealership.user_dealerships)
  @JoinColumn({ name: 'dealership_id' })
  dealership: Dealership;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
