import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
