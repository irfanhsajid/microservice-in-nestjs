import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Address, AddressType } from './entities/address.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AddressDto } from './dto/address.dto';
import { CustomLogger } from '../logger/logger.service';
import { throwCatchError } from 'src/app/common/utils/throw-error';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  private readonly logger = new CustomLogger(AddressService.name);

  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async create(dto: AddressDto): Promise<Address> {
    try {
      const newAddress = this.addressRepository.create(dto);
      return await this.addressRepository.save(newAddress);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  async findByEntityIdAndId(
    entityId: number,
    type: AddressType,
  ): Promise<Address[]> {
    try {
      const address = await this.addressRepository.find({
        where: { entity_id: entityId, type: type },
      });

      if (!address) {
        this.logger.warn(
          `Address not found for entityId: ${entityId}, type: ${type}`,
        );
        throw new NotFoundException(
          `Address not found for entityId: ${entityId}, type: ${type}`,
        );
      }
      return address;
    } catch (error) {
      this.logger.error(error);
      return [];
    }
  }

  async findOneByEntityIdAndId(
    entityId: number,
    type: AddressType,
  ): Promise<Address | null> {
    try {
      const address = await this.addressRepository.findOne({
        where: { entity_id: entityId, type: type },
      });

      if (!address) {
        this.logger.warn(
          `Address not found for entityId: ${entityId}, type: ${type}`,
        );
        throw new NotFoundException(
          `Address not found for entityId: ${entityId}, type: ${type}`,
        );
      }
      return address;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async update(id: number, dto: UpdateAddressDto): Promise<Address> {
    try {
      const existingAddress = await this.addressRepository.findOne({
        where: { id },
      });

      if (!existingAddress) {
        this.logger.warn(`Address not found for id: ${id}`);
        throw new NotFoundException(`Address not found for id: ${id}`);
      }

      // Update the existing address with DTO data
      this.addressRepository.merge(existingAddress, dto);

      // Save the updated address
      const updatedAddress = await this.addressRepository.save(existingAddress);
      this.logger.log(`Address with id: ${id} updated successfully`);
      return updatedAddress;
    } catch (error) {
      this.logger.error(
        `Error updating address with id: ${id}: ${error.message}`,
        error.stack,
      );
      return throwCatchError(error);
    }
  }
}
