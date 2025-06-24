import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RoleHasPermissions } from './role_has_permissions.entity';

export enum RoleStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: true, type: 'int' })
  dealership_id: number;

  @Column({ nullable: false, type: 'varchar', length: 100 })
  name: string;

  @Column({ nullable: false, type: 'varchar', length: 100 })
  guard: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: RoleStatus,
    default: RoleStatus.ACTIVE,
  })
  status: RoleStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @OneToMany(() => RoleHasPermissions, (rhp) => rhp.role, { cascade: true })
  role_has_permissions: RoleHasPermissions[];
}
