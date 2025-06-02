import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  first_name: string;

  @Column({ type: 'varchar', length: 50 })
  last_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string | null;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'date', nullable: true, default: null })
  email_verified_at: Date | null;

  @Column({ type: 'varchar', length: 255, select: true })
  password: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone_number: string | null;

  @Column({ type: 'boolean', nullable: true, default: false })
  status: boolean;

  @Column({ type: 'boolean', nullable: true, default: false })
  have_dealership: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string | null;

  @Column({ type: 'varchar', nullable: true })
  license_class: string | null;

  @Column({ type: 'boolean' })
  view_accept_privacy: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async comparePassword(plainTextPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainTextPassword, this.password);
  }
}
