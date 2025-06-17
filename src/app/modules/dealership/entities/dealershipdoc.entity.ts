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

@Entity('dealership_docs')
export class DealershipDoc {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Dealership, (dealership) => dealership.docs)
  @JoinColumn({ name: 'dealership_id' })
  dealership: Dealership;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
