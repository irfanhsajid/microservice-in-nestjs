import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
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

  @Column({ type: 'integer', nullable: true })
  parent_id: number;

  @ManyToOne(() => Permission, (permission) => permission.children)
  @JoinColumn({ name: 'parent_id' })
  parent: Permission;

  @OneToMany(() => Permission, (permission) => permission.parent)
  children: Permission[];

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
