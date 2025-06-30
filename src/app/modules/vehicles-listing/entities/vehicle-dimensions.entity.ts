import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Vehicle } from './vehicles.entity';

@Entity('vehicle_dimensions')
export class VehicleDimension {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  vehicle_id: number;

  @OneToOne(() => Vehicle, (vehicle) => vehicle.dimensions)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ type: 'varchar', nullable: true })
  length: string;

  @Column({ type: 'varchar', nullable: true })
  height: string;

  @Column({ type: 'varchar', nullable: true })
  wheelbase: string;

  @Column({ type: 'varchar', nullable: true })
  height_including_roof_rails: string;

  @Column({ type: 'varchar', nullable: true })
  width: string;

  @Column({ type: 'varchar', nullable: true })
  width_including_mirrors: string;

  @Column({ type: 'varchar', nullable: true })
  gross_weight: string;

  @Column({ type: 'varchar', nullable: true })
  max_loading_weight: string;

  @Column({ type: 'varchar', nullable: true })
  max_roof_load: string;

  @Column({ type: 'varchar', nullable: true })
  seats: string;
}
