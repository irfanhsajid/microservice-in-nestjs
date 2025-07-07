import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { VehicleFaxReportDetailsAccident } from './vehicle-fax-report-details-accident.entity';
import { VehicleFaxReportDetailsServiceRecord } from './vehicle-fax-report-details-service-record.entity';
import { VehicleFaxReportDetailsDetailedHistory } from './vehicle-fax-report-details-detailed-record.entity';
import { VehicleFaxReportDetailsRecall } from './vehicle-fax-report-details-recall.entity';
import { VehicleFaxReport } from './vehicle-fax-report.entity';

@Entity('vehicle_fax_report_details')
export class VehicleFaxReportDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  vin: string;

  @Column()
  model: string;

  @Column()
  odometer: string;

  @Column()
  country: string;

  @Column()
  registration: string;

  @Column()
  is_stolen: string;

  @Column({ nullable: false })
  vehicle_fax_report_id: number;

  @OneToMany(
    () => VehicleFaxReportDetailsAccident,
    (accident) => accident.vehicleFaxReportDetails,
    { cascade: true },
  )
  accidents: VehicleFaxReportDetailsAccident[];

  @OneToMany(
    () => VehicleFaxReportDetailsServiceRecord,
    (service) => service.vehicleFaxReportDetails,
    { cascade: true },
  )
  service_records: VehicleFaxReportDetailsServiceRecord[];

  @OneToMany(
    () => VehicleFaxReportDetailsDetailedHistory,
    (history) => history.vehicleFaxReportDetails,
    { cascade: true },
  )
  detailed_history: VehicleFaxReportDetailsDetailedHistory[];

  @OneToMany(
    () => VehicleFaxReportDetailsRecall,
    (recall) => recall.vehicleFaxReportDetails,
    { cascade: true },
  )
  recalls: VehicleFaxReportDetailsRecall[];

  @CreateDateColumn({ nullable: true })
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;

  @OneToOne(
    () => VehicleFaxReport,
    (vehicle) => vehicle.vehicle_fax_report_details,
  )
  @JoinColumn({ name: 'vehicle_fax_report_id' })
  vehicle_fax_report: VehicleFaxReport;
}
