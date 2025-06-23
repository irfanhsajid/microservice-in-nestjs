import { Injectable } from '@nestjs/common';
import { DealershipDetailsDto } from '../dto/dealership-details.dto';
import { CustomLogger } from '../../logger/logger.service';
import { throwCatchError } from 'src/app/common/utils/throw-error';
import { InjectRepository } from '@nestjs/typeorm';
import { Dealership } from '../entities/dealerships.entity';
import { QueryRunner, Repository } from 'typeorm';
import { UserDealership } from '../entities/user-dealership.entity';
import { User } from '../../user/entities/user.entity';
import { OnboardingInterface } from './interfaces/onboard.interface';
import { Request } from 'express';
import {
  DealershipAddress,
  DealershipAddressType,
} from '../entities/dealership-address.entity';
import { DealershipAddressDto } from '../dto/dealership-address.dto';
import { UpdateDealershipAddressDto } from '../dto/update-dealership-address.dto';
import { mapAddresses } from 'src/app/common/utils/map-address';

const ENTITY_TYPE = 'dealership';

@Injectable()
export class DealershipInformationService implements OnboardingInterface<any> {
  private readonly logger = new CustomLogger(DealershipInformationService.name);

  constructor(
    @InjectRepository(Dealership)
    private readonly dealershipRepository: Repository<Dealership>,

    @InjectRepository(UserDealership)
    private readonly userDealershipRepository: Repository<UserDealership>,

    @InjectRepository(DealershipAddress)
    private readonly dealershipAddressRepository: Repository<DealershipAddress>,
  ) {}

  async show(req: Request): Promise<any> {
    try {
      const user = req['user'] as User;

      // Find user dealership by user id with dealership relation
      const userDealership = await this.userDealershipRepository.findOne({
        where: { user: { id: user?.id }, is_default: true },
        relations: ['dealership'],
      });

      if (!userDealership) {
        return {} as Dealership;
      }

      // Fetch the dealership with its addresses
      const dealership = await this.dealershipRepository.findOne({
        where: {
          id: userDealership.dealership.id,
        },
        relations: ['addresses'],
      });
      const mapAddressesData = dealership?.addresses
        ? mapAddresses(dealership?.addresses)
        : {};
      const data = { ...dealership };
      delete data?.addresses;
      return {
        ...data,
        ...mapAddressesData,
      };
    } catch (error) {
      this.logger.error(
        `Error showing dealerships: ${error.message}`,
        error.stack,
      );
      return throwCatchError(error);
    }
  }

  async updateOrCreate(req: any, dto: DealershipDetailsDto): Promise<any> {
    const queryRunner =
      this.dealershipAddressRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = req['user'] as User;
      // Find user dealership by user id
      const userDealership = await queryRunner.manager.findOne(UserDealership, {
        where: { user: { id: user?.id }, is_default: true },
        relations: ['dealership'],
      });
      let dealership: Dealership;
      // if user default dealership not found create one
      if (!userDealership) {
        // Create a new dealership
        dealership = queryRunner.manager.create(Dealership, {
          name: dto.name,
          license_class: dto.license_class,
          business_type: dto.business_type,
          business_number: dto.business_number,
          omvic_number: dto.omvic_number,
          tax_identifier: dto.tax_identifier,
          phone_number: dto.phone_number,
          email: dto.email,
          website: dto.website,
        });
        dealership = await queryRunner.manager.save(Dealership, dealership);
        this.logger.log(`New dealership created with email ${dto.email}`);

        // create user default dealership
        const newUserDealership = queryRunner.manager.create(UserDealership, {
          user: user,
          dealership: dealership,
          is_default: true,
        });

        await queryRunner.manager.save(UserDealership, newUserDealership);
      } else {
        // Check if a dealership exists (e.g., by email or another unique field)
        const existingDealership = await queryRunner.manager.findOne(
          Dealership,
          {
            where: {
              id: userDealership.dealership.id,
            },
          },
        );
        if (!existingDealership) {
          dealership = queryRunner.manager.create(Dealership, {
            name: dto.name,
            license_class: dto.license_class,
            business_type: dto.business_type,
            business_number: dto.business_number,
            omvic_number: dto.omvic_number,
            tax_identifier: dto.tax_identifier,
            phone_number: dto.phone_number,
            email: dto.email,
            website: dto.website,
          });
          dealership = await queryRunner.manager.save(Dealership, dealership);
        } else {
          // Update existing dealership
          queryRunner.manager.merge(Dealership, existingDealership, {
            name: dto.name,
            license_class: dto.license_class,
            business_type: dto.business_type,
            business_number: dto.business_number,
            omvic_number: dto.omvic_number,
            tax_identifier: dto.tax_identifier,
            phone_number: dto.phone_number,
            email: dto.email,
            website: dto.website,
          });
          dealership = await queryRunner.manager.save(
            Dealership,
            existingDealership,
          );
          this.logger.log(`Dealership with email ${dto.email} updated`);
        }
      }

      let primary_address: DealershipAddress | null = null;
      let shipping_address: DealershipAddress[] = [];
      let mailing_address: DealershipAddress[] = [];

      // Handle primary address
      if (dto.primary_address) {
        dto.primary_address.entity_type = ENTITY_TYPE;
        dto.primary_address.entity_id = dealership.id;
        let newAddress: DealershipAddress | null = null;
        // check primary address already exist
        const primaryAddress = await queryRunner.manager.findOne(
          DealershipAddress,
          {
            where: {
              dealership_id: dealership.id,
              type: DealershipAddressType.PRIMARY,
            },
          },
        );
        if (primaryAddress) {
          // Update primary address
          this.logger.log('Primary address updated');
          const a = await this.updateAddress(
            primaryAddress?.id,
            dto.primary_address,
            queryRunner,
          );
          if (a) {
            newAddress = a;
          }
        } else {
          // create a new primary address
          this.logger.log('New Primary address created');
          const a = await this.createAddress(
            dealership,
            dto.primary_address,
            queryRunner,
          );
          if (a) {
            newAddress = a;
          }
        }
        if (newAddress) {
          primary_address = newAddress;
        }
      }

      if (dto.shipping_address && dto.shipping_address.length > 0) {
        shipping_address = await this.updateOrStoreAddresses(
          dealership,
          dto.shipping_address,
          DealershipAddressType.SHIPPING,
          queryRunner,
        );
      }

      // Handle mailing addresses
      if (dto.mailling_address && dto.mailling_address.length > 0) {
        mailing_address = await this.updateOrStoreAddresses(
          dealership,
          dto.mailling_address,
          DealershipAddressType.MAILING,
          queryRunner,
        );
      }

      // Commit the transaction
      await queryRunner.commitTransaction();
      return {
        ...dealership,
        ...(primary_address ? { primary_address: primary_address } : {}),
        ...(shipping_address.length > 0
          ? { shipping_address: shipping_address }
          : {}),
        ...(mailing_address.length > 0
          ? { mailing_address: mailing_address }
          : {}),
      };
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error updating or creating dealership: ${error.message}`,
        error.stack,
      );
      return throwCatchError(error);
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  private async updateOrStoreAddresses(
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

  async deleteAddressById(
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

  async updateAddress(
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

  async createAddress(
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
