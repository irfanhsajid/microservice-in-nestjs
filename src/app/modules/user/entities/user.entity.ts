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
import { DealershipPaymentInfo } from '../../dealership/entities/dealership-payment-info.entity';
import { DealershipAttachment } from '../../dealership/entities/dealership-attachment.entity';
import { VehicleVins } from '../../vehicles-listing/entities/vehicle-vins.entity';
import { VehicleAttachment } from '../../vehicles-listing/entities/vehicle-attachments.entity';

export enum UserAccountType {
  BUYER = 'BUYER',
  DEALER = 'DEALER',
  MODERATOR = 'MODERATOR',
  OTHER = 'OTHER',
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

  @Column({ type: 'timestamp', nullable: true, default: null })
  email_verified_at: Date | null;

  @Column({ type: 'timestamp', nullable: true, default: null })
  profile_completed: Date | null;

  @Column({ type: 'varchar', length: 255, select: true })
  password: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone_number: string | null;

  @Column({ type: 'boolean', nullable: true, default: true })
  status: boolean;

  @Column({ type: 'boolean' })
  accept_privacy: boolean;

  @Column({
    type: 'enum',
    enum: UserAccountType,
    default: UserAccountType.BUYER,
  })
  account_type: UserAccountType;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @OneToMany(() => UserDealership, (userDealership) => userDealership.user, {
    cascade: true,
  })
  user_dealerships: UserDealership[];

  @OneToMany(() => DealershipPaymentInfo, (paymentInfo) => paymentInfo.user, {
    cascade: true,
  })
  payment_infos: DealershipPaymentInfo[];

  @OneToMany(() => DealershipAttachment, (attachment) => attachment.user, {
    cascade: true,
  })
  attachments: DealershipAttachment[];

  @OneToMany(() => VehicleVins, (vehicleVins) => vehicleVins.user, {
    cascade: true,
  })
  vehicle_vins: VehicleVins[];

  @OneToMany(
    () => VehicleAttachment,
    (vechileAttachment) => vechileAttachment.user,
    {
      cascade: true,
    },
  )
  vehicle_attachment: VehicleAttachment[];

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
