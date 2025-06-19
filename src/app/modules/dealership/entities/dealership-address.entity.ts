import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { Dealership } from './dealerships.entity';

export enum DealershipAddressType {
  PRIMARY = 'PRIMARY',
  MAILING = 'MAILING',
  SHIPPING = 'SHIPPING',
}

@Entity('dealership_address')
export class DealershipAddress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  entity_type: string;

  @Column({ type: 'integer', nullable: false })
  entity_id: number;

  @Column({
    type: 'enum',
    enum: DealershipAddressType,
    default: DealershipAddressType.PRIMARY,
  })
  type: DealershipAddressType;

  @Column({ type: 'bool', default: false })
  make_as_default: boolean;

  @Column({ type: 'varchar', length: 255 })
  street_address: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 100 })
  state: string;

  @Column({ type: 'varchar', length: 20 })
  zip_code: string;

  @Column({ type: 'varchar', length: 100 })
  country: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(() => Dealership, (dealership) => dealership.addresses, {
    nullable: false,
  })
  dealership: Dealership;
}
