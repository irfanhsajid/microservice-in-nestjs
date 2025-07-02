import { Injectable } from '@nestjs/common';
import { CustomLogger } from '../../logger/logger.service';
import { VehicleInspectionLinkDto } from '../dto/vehicle-inspection-link.dto';
import { VehicleInspectionLink } from '../entities/vehicle-inspection-links.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../entities/vehicles.entity';
import { randomBytes } from 'crypto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class VehicleInspectionLinkService {
  private readonly logger = new CustomLogger(VehicleInspectionLinkService.name);
  constructor(
    @InjectQueue('vehicle-consumer')
    protected vehicleQueue: Queue,

    @InjectRepository(VehicleInspectionLink)
    private readonly vehicleInspectionLinkRepository: Repository<VehicleInspectionLink>,

    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  async createOrUpdate(
    dto: VehicleInspectionLinkDto,
    vehicleId: number,
  ): Promise<any> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId },
      relations: { vehicle_inspection_links: true },
    });

    if (!vehicle) {
      this.logger.error(`Vehicle with ID ${vehicleId} not found`);
      throw new Error(`Vehicle with ID ${vehicleId} not found`);
    }
    let vehicleInspectionLink: VehicleInspectionLink =
      vehicle.vehicle_inspection_links || null;

    const token = randomBytes(32).toString('hex');
    if (vehicleInspectionLink) {
      vehicleInspectionLink = this.vehicleInspectionLinkRepository.merge(
        vehicleInspectionLink,
        {
          token,
          ...dto,
        },
      );
    } else {
      vehicleInspectionLink = this.vehicleInspectionLinkRepository.create({
        token,
        ...dto,
        vehicle: vehicle,
      });
    }

    vehicleInspectionLink = await this.vehicleInspectionLinkRepository.save(
      vehicleInspectionLink,
    );

    await this.vehicleQueue.add('vehicle-inspection-link', {
      email: dto.email,
      phone: dto.phone,
      vehicleId: vehicle.id,
      token,
    });
    return vehicleInspectionLink;
  }

  async validateToken(token: string | undefined): Promise<User | null> {
    const vehicleInspectionLink =
      await this.vehicleInspectionLinkRepository.findOne({
        where: { token },
        relations: { vehicle: { vehicle_vin: { user: true } } },
      });

    if (!vehicleInspectionLink) {
      this.logger.warn('No inspection link found for the user');
      return null;
    }

    return vehicleInspectionLink.vehicle?.vehicle_vin?.user;
  }
}
