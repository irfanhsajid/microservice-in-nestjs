import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vehicle } from './vehicles.entity';

export enum FeatureType {
  INTERIOR = 'Interior',
  SAFETY = 'Safety',
  EXTERIOR = 'Exterior',
  COMFORT_CONVENIENCE = 'Comfort&Convenience',
}

export interface InteriorSpecs {
  air_conditioner?: boolean;
  digital_odometer?: boolean;
  heater?: boolean;
  leather_seats?: boolean;
  panoramic_moonroof?: boolean;
  tachometer?: boolean;
  touchscreen_display?: boolean;
}

export interface SafetySpecs {
  anti_lock_braking?: boolean;
  brake_assist?: boolean;
  child_safety_locks?: boolean;
  driver_air_bag?: boolean;
  power_door_locks?: boolean;
  stability_control?: boolean;
  traction_control?: boolean;
}

export interface ExteriorSpecs {
  fog_lights_front?: boolean;
  rain_sensing_wiper?: boolean;
  rear_spoiler?: boolean;
  windows_electric?: boolean;
}

export interface ComfortConvenienceSpecs {
  android_auto?: boolean;
  apple_carplay?: boolean;
  bluetooth?: boolean;
  homelink?: boolean;
  power_steering?: boolean;
}

@Entity('vehicle_features')
export class VehicleFeature {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  vehicle_id: number;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.vehicle_features)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ type: 'enum', enum: FeatureType, nullable: false })
  type: FeatureType;

  @Column({ type: 'json', nullable: true })
  specs: InteriorSpecs | SafetySpecs | ExteriorSpecs | ComfortConvenienceSpecs;
}
