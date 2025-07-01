import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { VehicleVins } from './vehicle-vins.entity';
import { VehicleFeature } from './vehicle-features.entity';
import { VehicleDimension } from './vehicle-dimensions.entity';
import { VehicleInformation } from './vehicle-informations.entity';
import { VehicleAttachment } from './vehicle-attachments.entity';
import { VehicleInspectionReport } from './vehicle-inspection-report.entity';
import { VehicleInspection } from './vehicle-inspection.entity';
import { VehicleFaxReport } from './vehicle-fax-report.entity';

export enum VehicleCondition {
  USED = 'USED',
  NEW = 'NEW',
}

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  vehicle_vin_id: number;

  @Column({ type: 'varchar', nullable: true })
  body: string;

  @Column({ type: 'varchar', nullable: true })
  mileage: string;

  @Column({ type: 'varchar', nullable: true })
  fuel_type: string;

  @Column({ type: 'varchar', nullable: true })
  business_phone: string;

  @Column({ type: 'varchar', nullable: true })
  model_year: string;

  @Column({ type: 'varchar', nullable: true })
  transmission: string;

  @Column({ type: 'varchar', nullable: true })
  drive_type: string;

  @Column({ type: 'enum', enum: VehicleCondition, nullable: true })
  condition: VehicleCondition;

  @Column({ type: 'varchar', nullable: true })
  engine_size: string;

  @Column({ type: 'varchar', nullable: true })
  door: string;

  @Column({ type: 'varchar', nullable: true })
  cylinder: string;

  @Column({ type: 'varchar', nullable: true })
  color: string;

  @CreateDateColumn({ nullable: true })
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @OneToOne(() => VehicleVins, (vehicle_vin) => vehicle_vin.vehicle)
  @JoinColumn({ name: 'vehicle_vin_id' })
  vehicle_vin: VehicleVins;

  @OneToOne(() => VehicleDimension, (dimension) => dimension.vehicle, {
    cascade: true,
  })
  dimensions: VehicleDimension;

  @OneToMany(() => VehicleFeature, (feature) => feature.vehicle, {
    cascade: true,
  })
  vehicle_features: VehicleFeature[];

  @OneToOne(() => VehicleInformation, (information) => information.vehicle, {
    cascade: true,
  })
  information: VehicleInformation[];

  @OneToMany(() => VehicleAttachment, (attachment) => attachment.vehicle, {
    cascade: true,
  })
  vehicle_attachments: VehicleAttachment[];

  @OneToOne(() => VehicleAttachment, (attachment) => attachment.vehicle, {
    cascade: true,
  })
  vehicle_attachment: VehicleAttachment[];

  @OneToMany(
    () => VehicleInspectionReport,
    (vehicleInspectionReport) => vehicleInspectionReport.vehicle,
    {
      cascade: true,
    },
  )
  vehicle_inspection_reports: VehicleInspectionReport[];

  @OneToOne(
    () => VehicleInspectionReport,
    (vehicleInspectionReport) => vehicleInspectionReport.vehicle,
    {
      cascade: true,
    },
  )
  vehicle_inspection_report: VehicleInspectionReport[];

  @OneToMany(
    () => VehicleInspection,
    (vehicleInspection) => vehicleInspection.vehicle,
    { cascade: true },
  )
  vehicle_inspections: VehicleInspection[];

  @OneToOne(
    () => VehicleFaxReport,
    (vehicleFaxReport) => vehicleFaxReport.vehicle,
    { cascade: true },
  )
  vehicle_fax_report: VehicleFaxReport;
}
