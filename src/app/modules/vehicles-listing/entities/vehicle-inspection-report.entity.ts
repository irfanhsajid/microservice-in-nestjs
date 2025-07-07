import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VehicleInspection } from './vehicle-inspection.entity';
import { Vehicle } from './vehicles.entity';

@Entity('vehicle_inspection_reports')
export class VehicleInspectionReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  vehicle_id: number;

  @Column({ default: 0 })
  point: number;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  details: string;

  @CreateDateColumn({ nullable: true })
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.vehicle_inspection_reports)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @OneToMany(
    () => VehicleInspection,
    (inspection) => inspection.vehicle_inspection_report,
    {
      cascade: true,
    },
  )
  inspections: VehicleInspection[];
}
