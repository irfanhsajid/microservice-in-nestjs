import { CustomLogger } from '../../logger/logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Dealership } from '../entities/dealerships.entity';
import { QueryRunner, Repository } from 'typeorm';
import { UserDealership } from '../entities/user-dealership.entity';
import {
  DealershipAddress,
  DealershipAddressType,
} from '../entities/dealership-address.entity';
import { DealershipAddressDto } from '../dto/dealership-address.dto';
import { UpdateDealershipAddressDto } from '../dto/update-dealership-address.dto';

const ENTITY_TYPE = 'dealership';

export class DealershipService {
  protected readonly logger = new CustomLogger(DealershipService.name);

  constructor(
    @InjectRepository(Dealership)
    protected readonly dealershipRepository: Repository<Dealership>,

    @InjectRepository(UserDealership)
    protected readonly userDealershipRepository: Repository<UserDealership>,

    @InjectRepository(DealershipAddress)
    protected readonly dealershipAddressRepository: Repository<DealershipAddress>,
  ) {}

  protected async updateOrStoreAddresses(
    dealership: Dealership,
    dto: DealershipAddressDto[],
    addressType: DealershipAddressType,
    queryRunner: QueryRunner,
  ): Promise<DealershipAddress[]> {
    const addresses: DealershipAddress[] = [];
    // find old addresses
    const oldAddresses = await queryRunner.manager.find(DealershipAddress, {
      where: { dealership_id: dealership.id, type: addressType },
    });

    if (oldAddresses?.length > 0) {
      const different = oldAddresses?.length - dto.length;
      if (different > 0) {
        // delete the find address by id and update remaining with new address list
        // More existing addresses than new ones - delete the excess
        const addressesToDelete = oldAddresses.slice(dto.length);
        for (const address of addressesToDelete) {
          await this.deleteAddressById(address.id, queryRunner);
          this.logger.log(
            `Deleted excess shipping address with id: ${address.id}`,
          );
        }

        // Update the remaining existing addresses with new data
        for (let i = 0; i < dto.length; i++) {
          dto[i].entity_type = ENTITY_TYPE;
          dto[i].entity_id = dealership.id;
          const newAddress = await this.updateAddress(
            oldAddresses[i].id,
            dto[i],
            queryRunner,
          );
          if (newAddress) {
            addresses.push(newAddress);
          }
          this.logger.log(
            `Updated shipping address with id: ${oldAddresses[i].id}`,
          );
        }
      } else if (different < 0) {
        // Create there different number of address and replace remailing
        for (let i = 0; i < oldAddresses.length; i++) {
          dto[i].entity_type = ENTITY_TYPE;
          dto[i].entity_id = dealership.id;
          const newAddress = await this.updateAddress(
            oldAddresses[i].id,
            dto[i],
            queryRunner,
          );
          if (newAddress) {
            addresses.push(newAddress);
          }
          this.logger.log(
            `Updated shipping address with id: ${oldAddresses[i].id}`,
          );
        }
        for (let i = oldAddresses.length; i < dto.length; i++) {
          dto[i].entity_type = ENTITY_TYPE;
          dto[i].entity_id = dealership.id;
          // const a = this.dealershipAddressRepository.create(dto[i]);
          const a = await this.createAddress(dealership, dto[i], queryRunner);
          if (a) {
            addresses.push(a);
          }
          this.logger.log(`Created new shipping address`);
        }
      } else {
        // Equal number of addresses - update all
        for (let i = 0; i < dto.length; i++) {
          dto[i].entity_type = ENTITY_TYPE;
          dto[i].entity_id = dealership.id;
          const newAddress = await this.updateAddress(
            oldAddresses[i].id,
            dto[i],
            queryRunner,
          );
          if (newAddress) {
            addresses.push(newAddress);
          }
          this.logger.log(
            `Updated shipping address with id: ${oldAddresses[i].id}`,
          );
        }
      }
    } else {
      for (const address of dto) {
        address.entity_type = ENTITY_TYPE;
        address.entity_id = dealership.id;
        const a = await this.createAddress(dealership, address, queryRunner);
        if (a) {
          addresses.push(a);
        }
      }
    }

    return addresses;
  }

  protected async deleteAddressById(
    id: number,
    queryRunner: QueryRunner,
  ): Promise<DealershipAddress | null> {
    try {
      // Find the address to delete
      const address = await queryRunner.manager.findOne(DealershipAddress, {
        where: { id },
      });

      if (!address) {
        this.logger.warn(`Address not found for id: ${id}`);
        return null;
      }

      // Perform hard delete
      await queryRunner.manager.delete(DealershipAddress, id);

      this.logger.log(`Address with id: ${id} hard deleted successfully`);
      return address;
    } catch (error) {
      this.logger.error(
        `Error deleting address with id: ${id}: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  protected async updateAddress(
    id: number,
    dto: UpdateDealershipAddressDto,
    queryRunner: QueryRunner,
  ): Promise<DealershipAddress | null> {
    try {
      const existingAddress = await queryRunner.manager.findOne(
        DealershipAddress,
        {
          where: { id },
        },
      );

      if (!existingAddress) {
        this.logger.warn(`Address not found for id: ${id}`);
        return null;
      }

      // Update the existing address with DTO data
      queryRunner.manager.merge(DealershipAddress, existingAddress, dto);

      // Save the updated address
      const updatedAddress = await queryRunner.manager.save(
        DealershipAddress,
        existingAddress,
      );
      this.logger.log(`Address with id: ${id} updated successfully`);
      return updatedAddress;
    } catch (error) {
      this.logger.error(
        `Error updating address with id: ${id}: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  protected async createAddress(
    dealership: Dealership,
    dto: DealershipAddressDto,
    queryRunner: QueryRunner,
  ): Promise<DealershipAddress | null> {
    try {
      const newAddress = queryRunner.manager.create(DealershipAddress, {
        ...dto,
        dealership,
      });
      return await queryRunner.manager.save(DealershipAddress, newAddress);
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }
}
