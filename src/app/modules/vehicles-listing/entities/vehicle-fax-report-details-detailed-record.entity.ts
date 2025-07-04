import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { VehicleFaxReportDetails } from './vehicle-fax-report-details.entity';

@Entity('vehicle_fax_report_details_service_history')
export class VehicleFaxReportDetailsDetailedHistory {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ nullable: false })
  vehicleFaxReportDetails_id: number;

  @ManyToOne(
    () => VehicleFaxReportDetails,
    (vehicleFaxReportDetails) => vehicleFaxReportDetails.detailed_history,
  )
  @JoinColumn({ name: 'vehicleFaxReportDetails_id' })
  vehicleFaxReportDetails: VehicleFaxReportDetails;

  @Column({ type: 'varchar', nullable: true })
  date: string;

  @Column({ type: 'varchar', nullable: true })
  odometer: string;

  @Column({ type: 'jsonb', nullable: true })
  source: string[];

  @Column({ type: 'varchar', nullable: true })
  record_type: string;

  @Column({ type: 'jsonb', nullable: true })
  details: { vehicle_serviced: string[] | null } | string[];
}
