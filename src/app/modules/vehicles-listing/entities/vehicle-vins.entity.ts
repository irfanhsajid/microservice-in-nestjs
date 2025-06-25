import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Dealership } from '../../dealership/entities/dealerships.entity';
import { Vehicle } from './vehicles.entity';

export enum MileageType {
  KM = 'KM',
  MM = 'MM',
}

export interface VehicleDiagnostic {
  vehicle_diagnostics?: boolean;
  electrical_issues?: boolean;
  engine_light?: boolean;
  unreported_accidents?: boolean;
  description: string;
}

export enum VehicleVinStatus {
  NEW = 'New',
  LISTED = 'Listed',
}

@Entity('vehicle_vins')
export class VehicleVins {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  user_id: number;

  @Column({ nullable: false })
  dealership_id: number;

  @Column({ type: 'varchar', nullable: false })
  vin_number: string;

  @Column({
    type: 'enum',
    enum: VehicleVinStatus,
    nullable: false,
  })
  status: VehicleVinStatus;

  @Column({ type: 'boolean', default: false })
  is_inspect: boolean;

  @Column({ type: 'boolean', default: false })
  is_report: boolean;

  @Column({ type: 'varchar', nullable: false })
  mileage: string;

  @Column({ type: 'enum', enum: MileageType, nullable: false })
  mileage_type: MileageType;

  @Column({ type: 'json', nullable: false })
  vehicle_diagnostics: VehicleDiagnostic[];

  @ManyToOne(() => User, (user) => user.vehicle_vins)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Dealership, (dealership) => dealership.vechicle_vins)
  @JoinColumn({ name: 'dealership_id' })
  dealership: Dealership;

  @OneToOne(() => Vehicle, (vehicle) => vehicle.vehicle_vin, {
    cascade: true,
  })
  vehicle: Vehicle;
}
