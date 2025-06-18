import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AddressType {
  PRIMARY = 'PRIMARY',
  MAILING = 'MAILING',
  SHIPPING = 'SHIPPING',
}

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  entity_type: string;

  @Column({ type: 'integer', nullable: false })
  entity_id: number;

  @Column({ type: 'enum', enum: AddressType, default: AddressType.PRIMARY })
  type: AddressType;

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
}
