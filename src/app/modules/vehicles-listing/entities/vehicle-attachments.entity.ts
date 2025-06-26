import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Vehicle } from './vehicles.entity';
import { User } from '../../user/entities/user.entity';

@Entity('vehicle_attachments')
export class VehicleAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  user_id: number;

  @ManyToOne(() => User, (user) => user.vehicle_attachment)
  user: User;

  @Column({ nullable: false })
  vehicle_id: number;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.vehicle_attachments)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  path: string;

  @Column({ type: 'varchar', nullable: true })
  size: string;

  @Column({ type: 'timestamp', nullable: true })
  expired_at: Date;

  @CreateDateColumn({ nullable: true })
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;
}
