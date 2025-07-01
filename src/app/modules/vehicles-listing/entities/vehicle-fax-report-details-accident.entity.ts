import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { VehicleFaxReportDetails } from './vehicle-fax-report-details.entity';

@Entity('vehicle_fax_report_details_accidents')
export class VehicleFaxReportDetailsAccident {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ nullable: false })
  vehicleFaxReportDetails_id: number;

  @ManyToOne(
    () => VehicleFaxReportDetails,
    (vehicleFaxReportDetails) => vehicleFaxReportDetails.accidents,
  )
  @JoinColumn({ name: 'vehicleFaxReportDetails_id' })
  vehicleFaxReportDetails: VehicleFaxReportDetails;

  @Column({ type: 'varchar', length: 20 })
  date: string;

  @Column({ type: 'varchar', length: 100 })
  location: string;

  @Column({ type: 'jsonb' })
  amounts: string[];

  @Column({ type: 'jsonb' })
  details: string[];
}
