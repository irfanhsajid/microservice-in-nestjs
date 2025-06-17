import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Dealership } from './dealerships.entity';

@Entity('dealership_payment_infos')
export class DealershipPaymentInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Dealership, (dealership) => dealership.payment_infos)
  @JoinColumn({ name: 'dealership_id' })
  dealership: Dealership;

  @Column({ type: 'varchar', length: 100 })
  account_name: string;

  @Column({ type: 'varchar', length: 50 })
  bank_name: string;

  @Column({ type: 'varchar', length: 20 })
  transit_number: string;

  @Column({ type: 'varchar', length: 20 })
  institution_number: string;

  @Column({ type: 'varchar', length: 20 })
  account_number: string;

  @Column({ type: 'varchar', length: 20 })
  email: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
