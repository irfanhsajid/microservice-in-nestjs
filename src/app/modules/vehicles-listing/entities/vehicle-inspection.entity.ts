import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Vehicle } from './vehicles.entity';
import { VehicleInspectionReport } from './vehicle-inspection-report.entity';

export enum VehicleInspectionTitleType {
  FRONT_VIEW = 'FRONT_VIEW',
  FRONT_RIGHT_ANGLE = 'FRONT_RIGHT_ANGLE',
  RIGHT_SIDE = 'RIGHT_SIDE',
  REAR_RIGHT_ANGLE = 'REAR_RIGHT_ANGLE',
  REAR_VIEW = 'REAR_VIEW',
  REAR_LEFT_ANGLE = 'REAR_LEFT_ANGLE',
  LEFT_SIDE = 'LEFT_SIDE',
  FRONT_LEFT_ANGLE = 'FRONT_LEFT_ANGLE',
  DASHBOARD_AND_ODOMETER = 'DASHBOARD_AND_ODOMETER',
  DRIVER_SEAT_AND_STREERING = 'DRIVER_SEAT_AND_STREERING',
  CENTER_CONSOLE = 'CENTER_CONSOLE',
  FRONT_PASSENGER_SEAT = 'FRONT_PASSENGER_SEAT',
  REAR_SEATING_AREA = 'REAR_SEATING_AREA',
}

export enum VehicleInspectionType {
  EXTERIOR = 'EXTERIOR',
  INTERIOR = 'INTERIOR',
  DAMAGE = 'DAMAGE',
}

@Entity('vehicle_inspections')
export class VehicleInspection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  vehicle_id: number;

  @Column({ nullable: false })
  vehicle_inspection_report_id: number;

  @Column({ type: 'enum', enum: VehicleInspectionTitleType, nullable: false })
  title: VehicleInspectionTitleType;

  @Column({ type: 'enum', enum: VehicleInspectionType, nullable: false })
  type: VehicleInspectionType;

  @Column()
  number_of_issues: number;

  @Column()
  path: string;

  @Column({ type: 'int', nullable: true })
  size: number;

  @Column({ type: 'text' })
  description: string;

  @CreateDateColumn({ nullable: true })
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.vehicle_attachments)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @ManyToOne(() => VehicleInspectionReport, (report) => report.inspections)
  @JoinColumn({ name: 'vehicle_inspection_report_id' })
  vehicle_inspection_report: VehicleInspectionReport;
}
