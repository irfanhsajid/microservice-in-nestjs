import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserDealership } from '../../dealership/entities/user-dealership.entity';
import { RoleHasPermission } from './role-has-permission.entity';

export enum RoleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  name: string;

  @Column({
    type: 'enum',
    enum: RoleStatus,
    nullable: false,
    default: 'ACTIVE',
  })
  status: RoleStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => RoleHasPermission, (rhp) => rhp.role, { cascade: true })
  roleHasPermissions: RoleHasPermission[];

  @OneToMany(() => UserDealership, (userRole) => userRole.role)
  user_roles: UserDealership[];
}
