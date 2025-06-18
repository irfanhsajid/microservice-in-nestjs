import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn, OneToOne,
} from 'typeorm';
import { UserDealership } from './user-dealership.entity';
import { DealershipPaymentInfo } from './dealership-payment-info.entity';
import { DealershipDoc } from './dealershipdoc.entity';
import { Address } from '../../address/entities/address.entity';

// General Dealer (G), Wholesale Dealer, Outside Ontario Dealer
export enum LicenseClass {
  GENERAL_DEALER = 'GENERAL_DEALER',
  WHOLESALE_DEALER = 'WHOLESALE_DEALER',
  OUTSIDE_ONTARIO_DEALER = 'OUTSIDE_ONTARIO_DEALER',
}

// Sole Proprietorship, Corporation (Inc./Ltd.), Partnership, LLP, Franchise, Cooperative,
export enum BusinessType {
  SOLE_PROPRIETORSHIP = 'SOLE_PROPRIETORSHIP',
  CORPORATION_INC_OR_LTD = 'CORPORATION_INC_OR_LTD',
  PARTNERSHIP = 'PARTNERSHIP',
  LLP = 'LLP',
  FRANCHISE = 'FRANCHISE',
  COOPERATIVE = 'COOPERATIVE',
}

@Entity('dealerships')
export class Dealership {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'enum', enum: LicenseClass })
  license_class: LicenseClass;

  @Column({ type: 'enum', enum: BusinessType })
  business_type: BusinessType;

  @Column({ type: 'varchar', length: 50 })
  business_number: string;

  @Column({ type: 'varchar', length: 20 })
  omvic_number: string;

  @Column({ type: 'varchar', length: 20 })
  tax_identifier: string;

  @Column({ type: 'varchar', length: 20 })
  phone_number: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  website: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @OneToMany(
    () => UserDealership,
    (userDealership) => userDealership.dealership,
    {
      cascade: true,
    },
  )
  user_dealerships: UserDealership[];

  @OneToOne(
    () => DealershipPaymentInfo,
    (paymentInfo) => paymentInfo.dealership,
    {
      cascade: true,
    },
  )
  payment_infos: DealershipPaymentInfo[];

  @OneToMany(() => Address, (address) => address, {
    cascade: true,
  })
  addresses: Address[];

  @OneToMany(() => DealershipDoc, (doc) => doc.dealership, {
    cascade: true,
  })
  docs: DealershipDoc[];
}
