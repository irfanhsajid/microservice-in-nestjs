import { Injectable, NotFoundException } from '@nestjs/common';
import { DealershipDetailsDto } from '../dto/dealership-details.dto';
import { CustomLogger } from '../../logger/logger.service';
import { throwCatchError } from 'src/app/common/utils/throw-error';
import { InjectRepository } from '@nestjs/typeorm';
import { Dealership } from '../entities/dealerships.entity';
import { Repository } from 'typeorm';
import { AddressService } from '../../address/address.service';
import { UserDealership } from '../entities/user-dealership.entity';
import { User } from '../../user/entities/user.entity';
import { AddressType } from '../../address/entities/address.entity';
import { OnboardingInterface } from './interfaces/onboard.interface';
import { Request } from 'express';

const ENTITY_TYPE = 'dealership';

@Injectable()
export class DealershipInformationService implements OnboardingInterface<any> {
  private readonly logger = new CustomLogger(DealershipInformationService.name);

  constructor(
    @InjectRepository(Dealership)
    private readonly dealershipRepository: Repository<Dealership>,

    private readonly addressService: AddressService,

    @InjectRepository(UserDealership)
    private readonly userDealershipRepository: Repository<UserDealership>,
  ) {}

  async show(req: Request): Promise<any> {
    console.info(req);
    try {
      // Implement logic to show dealership information (e.g., fetch all or by some criteria)
      const dealerships = await this.dealershipRepository.find({
        relations: ['addresses'], // Load related addresses
      });
      return dealerships;
    } catch (error) {
      this.logger.error(
        `Error showing dealerships: ${error.message}`,
        error.stack,
      );
      return throwCatchError(error);
    }
  }

  async updateOrCreate(
    req: any,
    dto: DealershipDetailsDto,
  ): Promise<Dealership> {
    try {
      const user = req['user'] as User;
      // Find user dealership by user id
      const userDealership = await this.userDealershipRepository.findOne({
        where: { user: { id: user?.id }, is_default: true },
        relations: ['dealership'],
      });
      console.info('User dealership', userDealership);
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
          throw new NotFoundException('Not dealership found to update');
        }
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

      // Handle primary address
      if (dto.primary_address) {
        dto.primary_address.entity_type = ENTITY_TYPE;
        dto.primary_address.entity_id = dealership.id;
        // check primary address already exist
        const primaryAddress = await this.addressService.findOneByEntityIdAndId(
          dealership.id,
          AddressType.PRIMARY,
        );
        if (primaryAddress) {
          // Update primary address
          await this.addressService.update(
            primaryAddress?.id,
            dto.primary_address,
          );
        } else {
          // create new primary address
          await this.addressService.create(dto.primary_address);
        }
      }

      // Handle shipping addresses
      if (dto.shipping_address && dto.shipping_address.length > 0) {
        // find shipping addresses
        const shippingAddresses = await this.addressService.findByEntityIdAndId(
          dealership.id,
          AddressType.SHIPPING,
        );
        if (shippingAddresses?.length > 0) {
          const defferent =
            shippingAddresses?.length - dto.shipping_address.length;
          if (defferent > 0) {
            // delete the find address by id and update remaining with new address list
            // More existing addresses than new ones - delete the excess
            const addressesToDelete = shippingAddresses.slice(
              dto.shipping_address.length,
            );
            for (const address of addressesToDelete) {
              await this.addressService.deleteById(address.id);
              this.logger.log(
                `Deleted excess shipping address with id: ${address.id}`,
              );
            }

            // Update the remaining existing addresses with new data
            for (let i = 0; i < dto.shipping_address.length; i++) {
              dto.shipping_address[i].entity_type = ENTITY_TYPE;
              dto.shipping_address[i].entity_id = dealership.id;
              await this.addressService.update(
                shippingAddresses[i].id,
                dto.shipping_address[i],
              );
              this.logger.log(
                `Updated shipping address with id: ${shippingAddresses[i].id}`,
              );
            }
          } else if (defferent < 0) {
            // Create there defferent number of address and replace remailing
            for (let i = 0; i < shippingAddresses.length; i++) {
              dto.shipping_address[i].entity_type = ENTITY_TYPE;
              dto.shipping_address[i].entity_id = dealership.id;
              await this.addressService.update(
                shippingAddresses[i].id,
                dto.shipping_address[i],
              );
              this.logger.log(
                `Updated shipping address with id: ${shippingAddresses[i].id}`,
              );
            }
            for (
              let i = shippingAddresses.length;
              i < dto.shipping_address.length;
              i++
            ) {
              dto.shipping_address[i].entity_type = ENTITY_TYPE;
              dto.shipping_address[i].entity_id = dealership.id;
              await this.addressService.create(dto.shipping_address[i]);
              this.logger.log(`Created new shipping address`);
            }
          } else {
            // Equal number of addresses - update all
            for (let i = 0; i < dto.shipping_address.length; i++) {
              dto.shipping_address[i].entity_type = ENTITY_TYPE;
              dto.shipping_address[i].entity_id = dealership.id;
              await this.addressService.update(
                shippingAddresses[i].id,
                dto.shipping_address[i],
              );
              this.logger.log(
                `Updated shipping address with id: ${shippingAddresses[i].id}`,
              );
            }
          }
        } else {
          for (const address of dto.shipping_address) {
            address.entity_type = ENTITY_TYPE;
            address.entity_id = dealership.id;
            await this.addressService.create(address);
          }
        }
      }

      // Handle mailing addresses
      if (dto.mailing_address && dto.mailing_address.length > 0) {
        // Find existing mailing addresses
        const mailingAddresses = await this.addressService.findByEntityIdAndId(
          dealership.id,
          AddressType.MAILING,
        );

        if (mailingAddresses?.length > 0) {
          const difference =
            mailingAddresses.length - dto.mailing_address.length;

          if (difference > 0) {
            // More existing addresses than new ones - delete the excess
            const addressesToDelete = mailingAddresses.slice(
              dto.mailing_address.length,
            );
            for (const address of addressesToDelete) {
              await this.addressService.deleteById(address.id);
              this.logger.log(
                `Deleted excess mailing address with id: ${address.id}`,
              );
            }

            // Update the remaining existing addresses with new data
            for (let i = 0; i < dto.mailing_address.length; i++) {
              dto.mailing_address[i].entity_type = ENTITY_TYPE;
              dto.mailing_address[i].entity_id = dealership.id;
              await this.addressService.update(
                mailingAddresses[i].id,
                dto.mailing_address[i],
              );
              this.logger.log(
                `Updated mailing address with id: ${mailingAddresses[i].id}`,
              );
            }
          } else if (difference < 0) {
            // More new addresses than existing ones - update existing and create the difference
            for (let i = 0; i < mailingAddresses.length; i++) {
              dto.mailing_address[i].entity_type = ENTITY_TYPE;
              dto.mailing_address[i].entity_id = dealership.id;
              await this.addressService.update(
                mailingAddresses[i].id,
                dto.mailing_address[i],
              );
              this.logger.log(
                `Updated mailing address with id: ${mailingAddresses[i].id}`,
              );
            }
            for (
              let i = mailingAddresses.length;
              i < dto.mailing_address.length;
              i++
            ) {
              dto.mailing_address[i].entity_type = ENTITY_TYPE;
              dto.mailing_address[i].entity_id = dealership.id;
              await this.addressService.create(dto.mailing_address[i]);
              this.logger.log(`Created new mailing address`);
            }
          } else {
            // Equal number of addresses - update all
            for (let i = 0; i < dto.mailing_address.length; i++) {
              dto.mailing_address[i].entity_type = ENTITY_TYPE;
              dto.mailing_address[i].entity_id = dealership.id;
              await this.addressService.update(
                mailingAddresses[i].id,
                dto.mailing_address[i],
              );
              this.logger.log(
                `Updated mailing address with id: ${mailingAddresses[i].id}`,
              );
            }
          }
        } else {
          // No existing mailing addresses - create all new ones
          for (const address of dto.mailing_address) {
            address.entity_type = ENTITY_TYPE;
            address.entity_id = dealership.id;
            await this.addressService.create(address);
            this.logger.log(`Created new mailing address`);
          }
        }
      }
      console.info('new', dealership);
      return dealership;
    } catch (error) {
      this.logger.error(
        `Error updating or creating dealership: ${error.message}`,
        error.stack,
      );
      return throwCatchError(error);
    }
  }
}
