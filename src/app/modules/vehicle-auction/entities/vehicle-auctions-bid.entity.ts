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
import { VehicleAuction } from './vehicle-auctions.entity';
import { User } from '../../user/entities/user.entity';

@Entity('vehicle_auctions_bids')
export class VehicleAuctionBid {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  vehicle_id: number;

  @Column({ nullable: false })
  vehicle_auction_id: number;

  @Column({ nullable: false })
  user_id: number;

  @Column({ type: 'int' })
  amount: number;

  @CreateDateColumn({ nullable: true })
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.vehicle_auction_bids)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @ManyToOne(
    () => VehicleAuction,
    (vehicleAuction) => vehicleAuction.vehicle_auction_bids,
  )
  @JoinColumn({ name: 'vehicle_auction_id' })
  vehicle_auction: VehicleAuction;

  @ManyToOne(() => User, (user) => user.vehicle_auction_bids)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
