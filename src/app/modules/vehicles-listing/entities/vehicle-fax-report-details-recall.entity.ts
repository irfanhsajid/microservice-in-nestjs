import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { VehicleFaxReportDetails } from './vehicle-fax-report-details.entity';

@Entity('vehicle_fax_report_details_recall')
export class VehicleFaxReportDetailsRecall {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ nullable: false })
  vehicleFaxReportDetails_id: number;

  @ManyToOne(
    () => VehicleFaxReportDetails,
    (vehicleFaxReportDetails) => vehicleFaxReportDetails.recalls,
  )
  @JoinColumn({ name: 'vehicleFaxReportDetails_id' })
  vehicleFaxReportDetails: VehicleFaxReportDetails;

  @Column({ type: 'varchar', nullable: true })
  recall_number: string;

  @Column({ type: 'varchar', nullable: true })
  recall_date: string;
}
