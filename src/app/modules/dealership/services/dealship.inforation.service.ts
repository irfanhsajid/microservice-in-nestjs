import { Injectable } from '@nestjs/common';
import { DealershipDetailsDto } from '../dto/dealership-details.dto';
import { CustomLogger } from '../../logger/logger.service';
import { throwCatchError } from 'src/app/common/utils/throw-error';
import { InjectRepository } from '@nestjs/typeorm';
import { Dealership } from '../entities/dealerships.entity';
import { Repository } from 'typeorm';
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
    try {
      const user = req['user'] as User;
      // Find user dealership by user id
      const userDealership = await this.userDealershipRepository.findOne({
        where: { user: { id: user?.id }, is_default: true },
        relations: ['dealership'],
      });
      let dealership: Dealership;
      // if user default dealership not found create one
      if (!userDealership) {
        // Create new dealership
        dealership = this.dealershipRepository.create({
          name: dto.name,
          license_class: dto.dealer_class,
          business_type: dto.business_type,
          business_number: dto.business_number,
          omvic_number: dto.omvic_number,
          tax_identifier: dto.tax_identifier,
          phone_number: dto.phone_number,
          email: dto.email,
          website: dto.website,
        });
        dealership = await this.dealershipRepository.save(dealership);
        this.logger.log(`New dealership created with email ${dto.email}`);

        // create user default dealership
        const newUserDealership = this.userDealershipRepository.create({
          user: user,
          dealership: dealership,
          is_default: true,
        });

        await this.userDealershipRepository.save(newUserDealership);
      } else {
        // Check if dealership exists (e.g., by email or another unique field)
        const existingDealership = await this.dealershipRepository.findOne({
          where: {
            id: userDealership.dealership.id,
          },
        });
        if (!existingDealership) {
          dealership = this.dealershipRepository.create({
            name: dto.name,
            license_class: dto.dealer_class,
            business_type: dto.business_type,
            business_number: dto.business_number,
            omvic_number: dto.omvic_number,
            tax_identifier: dto.tax_identifier,
            phone_number: dto.phone_number,
            email: dto.email,
            website: dto.website,
          });
          dealership = await this.dealershipRepository.save(dealership);
        } else {
          // Update existing dealership
          this.dealershipRepository.merge(existingDealership, {
            name: dto.name,
            license_class: dto.dealer_class,
            business_type: dto.business_type,
            business_number: dto.business_number,
            omvic_number: dto.omvic_number,
            tax_identifier: dto.tax_identifier,
            phone_number: dto.phone_number,
            email: dto.email,
            website: dto.website,
          });
          dealership = await this.dealershipRepository.save(existingDealership);
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
        const primaryAddress = await this.dealershipAddressRepository.findOne({
          where: {
            entity_id: dealership.id,
            type: DealershipAddressType.PRIMARY,
          },
        });
        if (primaryAddress) {
          // Update primary address
          this.logger.log('Primary address updated');
          const a = await this.updateAddress(
            primaryAddress?.id,
            dto.primary_address,
          );
          if (a) {
            newAddress = a;
          }
        } else {
          // create new primary address
          this.logger.log('New Primary address created');
          const a = await this.createAddress(dealership, dto.primary_address);
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
        );
      }

      // Handle mailing addresses
      if (dto.mailing_address && dto.mailing_address.length > 0) {
        mailing_address = await this.updateOrStoreAddresses(
          dealership,
          dto.mailing_address,
          DealershipAddressType.MAILING,
        );
      }
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
      this.logger.error(
        `Error updating or creating dealership: ${error.message}`,
        error.stack,
      );
      return throwCatchError(error);
    }
  }

  private async updateOrStoreAddresses(
    dealership: Dealership,
    dto: DealershipAddressDto[],
    addressType: DealershipAddressType,
  ): Promise<DealershipAddress[]> {
    const addresses: DealershipAddress[] = [];
    // find old addresses
    const oldAddresses = await this.dealershipAddressRepository.find({
      where: { entity_id: dealership.id, type: addressType },
    });

    if (oldAddresses?.length > 0) {
      const defferent = oldAddresses?.length - dto.length;
      if (defferent > 0) {
        // delete the find address by id and update remaining with new address list
        // More existing addresses than new ones - delete the excess
        const addressesToDelete = oldAddresses.slice(dto.length);
        for (const address of addressesToDelete) {
          await this.deleteAddressById(address.id);
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
          );
          if (newAddress) {
            addresses.push(newAddress);
          }
          this.logger.log(
            `Updated shipping address with id: ${oldAddresses[i].id}`,
          );
        }
      } else if (defferent < 0) {
        // Create there defferent number of address and replace remailing
        for (let i = 0; i < oldAddresses.length; i++) {
          dto[i].entity_type = ENTITY_TYPE;
          dto[i].entity_id = dealership.id;
          const newAddress = await this.updateAddress(
            oldAddresses[i].id,
            dto[i],
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
          const a = await this.createAddress(dealership, dto[i]);
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
        const a = await this.createAddress(dealership, address);
        if (a) {
          addresses.push(a);
        }
      }
    }

    return addresses;
  }

  async deleteAddressById(id: number): Promise<DealershipAddress | null> {
    try {
      // Find the address to delete
      const address = await this.dealershipAddressRepository.findOne({
        where: { id },
      });

      if (!address) {
        this.logger.warn(`Address not found for id: ${id}`);
        return null;
      }

      // Perform hard delete
      await this.dealershipAddressRepository.delete(id);

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
  ): Promise<DealershipAddress | null> {
    try {
      const existingAddress = await this.dealershipAddressRepository.findOne({
        where: { id },
      });

      if (!existingAddress) {
        this.logger.warn(`Address not found for id: ${id}`);
        return null;
      }

      // Update the existing address with DTO data
      this.dealershipAddressRepository.merge(existingAddress, dto);

      // Save the updated address
      const updatedAddress =
        await this.dealershipAddressRepository.save(existingAddress);
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
  ): Promise<DealershipAddress | null> {
    try {
      const newAddress = this.dealershipAddressRepository.create({
        ...dto,
        dealership,
      });
      return await this.dealershipAddressRepository.save(newAddress);
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }
}
