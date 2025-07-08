import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Vehicle } from '../../vehicles-listing/entities/vehicles.entity';
import { Dealership } from '../../dealership/entities/dealerships.entity';
import { DealershipAddress } from '../../dealership/entities/dealership-address.entity';
import { AuctionType } from '../enums/auction-type';
import { VehicleAuctionBid } from './vehicle-auctions-bid.entity';

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

  @Column({ nullable: false })
  starting_time: Date;

  @Column({ nullable: false })
  ending_time: Date;

  @Column({ type: 'int' })
  starting_amount: number;

  @Column({ type: 'int' })
  reserve_amount: number;

  @Column({ type: 'boolean', nullable: true })
  financing: boolean;

  @Column({ type: 'boolean', nullable: true })
  trade: boolean;

  @Column({ type: 'boolean', nullable: true })
  warranty: boolean;

  @Column({ type: 'jsonb', nullable: true })
  warranty_data: any;

  @CreateDateColumn({ nullable: true })
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.vehicle_auctions)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @ManyToOne(() => Dealership, (dealership) => dealership.vehicle_auctions)
  @JoinColumn({ name: 'dealership_id' })
  dealership: Dealership;

  @ManyToOne(() => DealershipAddress, (address) => address.vehicle_auctions)
  @JoinColumn({ name: 'shipping_address_id' })
  addresses: DealershipAddress[];

  @OneToMany(
    () => VehicleAuctionBid,
    (vehicleAuctionBin) => vehicleAuctionBin.vehicle_auction,
    { cascade: true },
  )
  vehicle_auction_bids: VehicleAuctionBid[];
}
