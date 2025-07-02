import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Vehicle } from './vehicles.entity';
import { VehicleFaxReportDetails } from './vehicle-fax-report-details.entity';

export enum VehicleFaxReportStatus {
  REQUESTED = 'REQUESTED',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

@Entity('vehicle_fax_report')
export class VehicleFaxReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  vehicle_id: number;

  @Column({
    type: 'enum',
    enum: VehicleFaxReportStatus,
    nullable: false,
    default: VehicleFaxReportStatus.REQUESTED,
  })
  status: VehicleFaxReportStatus;

  @Column({ type: 'varchar', nullable: true })
  attachment: string;

  @Column({ nullable: false })
  expired_at: Date;

  @CreateDateColumn({ nullable: true })
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;

  @OneToOne(() => Vehicle, (vehicle) => vehicle.vehicle_fax_report)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @OneToOne(
    () => VehicleFaxReportDetails,
    (vehicleFaxReportDetails) => vehicleFaxReportDetails.vehicle_fax_report,
    { cascade: true },
  )
  vehicle_fax_report_details: VehicleFaxReportDetails;
}
