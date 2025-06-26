import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vehicle } from './vehicles.entity';

@Entity('vehicle_informations')
export class VehicleInformation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  vehicle_id: number;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.information)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  characteristics: object;
}
