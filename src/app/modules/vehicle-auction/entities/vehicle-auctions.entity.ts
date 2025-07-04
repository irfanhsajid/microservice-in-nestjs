import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Vehicle } from '../../vehicles-listing/entities/vehicles.entity';
import { Dealership } from '../../dealership/entities/dealerships.entity';
import { DealershipAddress } from '../../dealership/entities/dealership-address.entity';
import { AuctionType } from '../enums/auction-type';

@Entity('vehicle_auctions')
export class VehicleAuction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  vehicle_id: number;

  @Column({ nullable: false })
  dealership_id: number;

  @Column({ nullable: false })
  shipping_address_id: number;

  @Column({ type: 'enum', enum: AuctionType, nullable: false })
  type: AuctionType;

  @CreateDateColumn({ nullable: true })
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.vehicle_attachments)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @ManyToOne(() => Dealership, (dealership) => dealership.vechicle_vins)
  @JoinColumn({ name: 'dealership_id' })
  dealership: Dealership;

  @ManyToOne(() => DealershipAddress, (address) => address.vehicle_auctions)
  @JoinColumn({ name: 'shipping_address_id' })
  addresses: DealershipAddress[];
}
