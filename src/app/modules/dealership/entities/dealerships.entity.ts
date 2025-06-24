import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
} from 'typeorm';
import { UserDealership } from './user-dealership.entity';
import { DealershipPaymentInfo } from './dealership-payment-info.entity';
import {
  DealershipAddress,
  DealershipAddressType,
} from './dealership-address.entity';
import { DealershipAttachment } from './dealership-attachment.entity';
import { VehicleVins } from '../../vehicles-listing/entities/vehicle-vins.entity';

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

  @Column({ type: 'varchar', length: 100 })
  business_number: string;

  @Column({ type: 'varchar', length: 100 })
  omvic_number: string;

  @Column({ type: 'varchar', length: 100 })
  tax_identifier: string;

  @Column({ type: 'varchar', length: 100 })
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

  @OneToOne(() => UserDealership, (userDealership) => userDealership.dealership)
  user_dealerships: UserDealership;

  @OneToOne(
    () => DealershipPaymentInfo,
    (paymentInfo) => paymentInfo.dealership,
    {
      cascade: true,
    },
  )
  payment_infos: DealershipPaymentInfo[];

  @OneToMany(
    () => DealershipAttachment,
    (dealershipAttachment) => dealershipAttachment.dealership,
    {
      cascade: true,
    },
  )
  attachments: DealershipAttachment[];

  @OneToMany(() => DealershipAddress, (address) => address.dealership, {
    cascade: true,
  })
  addresses: DealershipAddress[];

  @OneToMany(() => VehicleVins, (vechicleVins) => vechicleVins.dealership, {
    cascade: true,
  })
  vechicle_vins: VehicleVins[];

  // Helper method to get the primary address
  get primaryAddress(): DealershipAddress | undefined {
    return this.addresses?.find(
      (address) => address.type === DealershipAddressType.PRIMARY,
    );
  }

  // Helper method to get the mailing address
  get mailingAddress(): DealershipAddress | undefined {
    return this.addresses?.find(
      (address) => address.type === DealershipAddressType.MAILING,
    );
  }

  // Helper method to get the shipping address
  get shippingAddress(): DealershipAddress | undefined {
    return this.addresses?.find(
      (address) => address.type === DealershipAddressType.SHIPPING,
    );
  }
}
