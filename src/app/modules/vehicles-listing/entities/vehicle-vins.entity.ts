import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Dealership } from '../../dealership/entities/dealerships.entity';

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
}
