import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vehicle } from './vehicles.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum FeatureType {
  INTERIOR = 'Interior',
  SAFETY = 'Safety',
  EXTERIOR = 'Exterior',
  COMFORT_CONVENIENCE = 'Comfort&Convenience',
}

// export interface InteriorSpecs {
//   air_conditioner?: boolean;
//   digital_odometer?: boolean;
//   heater?: boolean;
//   leather_seats?: boolean;
//   panoramic_moonroof?: boolean;
//   tachometer?: boolean;
//   touchscreen_display?: boolean;
// }
//
// export interface SafetySpecs {
//   anti_lock_braking?: boolean;
//   brake_assist?: boolean;
//   child_safety_locks?: boolean;
//   driver_air_bag?: boolean;
//   power_door_locks?: boolean;
//   stability_control?: boolean;
//   traction_control?: boolean;
// }
//
// export interface ExteriorSpecs {
//   fog_lights_front?: boolean;
//   rain_sensing_wiper?: boolean;
//   rear_spoiler?: boolean;
//   windows_electric?: boolean;
// }
//
// export interface ComfortConvenienceSpecs {
//   android_auto?: boolean;
//   apple_carplay?: boolean;
//   bluetooth?: boolean;
//   homelink?: boolean;
//   power_steering?: boolean;
// }
//
export class InteriorSpecs {
  @ApiPropertyOptional() air_conditioner?: boolean;
  @ApiPropertyOptional() digital_odometer?: boolean;
  @ApiPropertyOptional() heater?: boolean;
  @ApiPropertyOptional() leather_seats?: boolean;
  @ApiPropertyOptional() panoramic_moonroof?: boolean;
  @ApiPropertyOptional() tachometer?: boolean;
  @ApiPropertyOptional() touchscreen_display?: boolean;
}

export class SafetySpecs {
  @ApiPropertyOptional() anti_lock_braking?: boolean;
  @ApiPropertyOptional() brake_assist?: boolean;
  @ApiPropertyOptional() child_safety_locks?: boolean;
  @ApiPropertyOptional() driver_air_bag?: boolean;
  @ApiPropertyOptional() power_door_locks?: boolean;
  @ApiPropertyOptional() stability_control?: boolean;
  @ApiPropertyOptional() traction_control?: boolean;
}

export class ExteriorSpecs {
  @ApiPropertyOptional() fog_lights_front?: boolean;
  @ApiPropertyOptional() rain_sensing_wiper?: boolean;
  @ApiPropertyOptional() rear_spoiler?: boolean;
  @ApiPropertyOptional() windows_electric?: boolean;
}

export class ComfortConvenienceSpecs {
  @ApiPropertyOptional() android_auto?: boolean;
  @ApiPropertyOptional() apple_carplay?: boolean;
  @ApiPropertyOptional() bluetooth?: boolean;
  @ApiPropertyOptional() homelink?: boolean;
  @ApiPropertyOptional() power_steering?: boolean;
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
