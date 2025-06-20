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

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  guard: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => RoleHasPermission, (rolePermission) => rolePermission.role)
  permissions: RoleHasPermission[];

  @OneToMany(() => UserDealership, (userRole) => userRole.role)
  user_roles: UserDealership[];
}
