import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserDealership } from '../../dealership/entities/user-dealership.entity';
import { Attachment } from '../../attachment/entities/attachment.entity';

export enum AccountType {
  BUYER = '1',
  SELLER = '2',
  MODERATOR = '3',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  name: string;

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

  @Column({ type: 'boolean', nullable: true, default: true })
  status: boolean;

  @Column({ type: 'boolean' })
  accept_privacy: boolean;

  @Column({ type: 'enum', enum: AccountType, default: AccountType.BUYER })
  account_type: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @OneToMany(() => UserDealership, (userDealership) => userDealership.user)
  user_dealerships: UserDealership[];

  @OneToMany(() => Attachment, (attachment) => attachment.user)
  attachments: Attachment[];

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
