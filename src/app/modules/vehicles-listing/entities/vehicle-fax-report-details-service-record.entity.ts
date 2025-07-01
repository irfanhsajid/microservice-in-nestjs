import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { VehicleFaxReportDetails } from './vehicle-fax-report-details.entity';

@Entity('vehicle_fax_report_details_service_records')
export class VehicleFaxReportDetailsServiceRecord {
  @PrimaryGeneratedColumn('uuid')
  service_id: string;

  @Column({ nullable: false })
  vehicleFaxReportDetails_id: number;

  @ManyToOne(
    () => VehicleFaxReportDetails,
    (vehicleFaxReportDetails) => vehicleFaxReportDetails.service_records,
  )
  @JoinColumn({ name: 'vehicleFaxReportDetails_id' })
  vehicleFaxReportDetails: VehicleFaxReportDetails;

  @Column({ type: 'varchar', length: 20 })
  date: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  odometer: string;

  @Column({ type: 'jsonb' })
  source: string[];

  @Column({ type: 'jsonb', nullable: true })
  details: { vehicle_serviced: string[] | null };
}
