import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RoleHasPermission } from './role-has-permission.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 35, nullable: true })
  guard_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  group_name: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(
    () => RoleHasPermission,
    (rolePermission) => rolePermission.permission,
  )
  roles: RoleHasPermission[];
}
