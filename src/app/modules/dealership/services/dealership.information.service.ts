import { Injectable } from '@nestjs/common';
import { DealershipDetailsDto } from '../dto/dealership-details.dto';
import { throwCatchError } from 'src/app/common/utils/throw-error';
import { Dealership } from '../entities/dealerships.entity';
import { UserDealership } from '../entities/user-dealership.entity';
import { User } from '../../user/entities/user.entity';
import { OnboardingInterface } from './interfaces/onboard.interface';
import { Request } from 'express';
import {
  DealershipAddress,
  DealershipAddressType,
} from '../entities/dealership-address.entity';
import { mapAddresses } from 'src/app/common/utils/map-address';
import { DealershipService } from './UserDealership.service';

const ENTITY_TYPE = 'dealership';

@Injectable()
export class DealershipInformationService
  extends DealershipService
  implements OnboardingInterface<any>
{
  async show(req: Request): Promise<any> {
    try {
      // Find user dealership by user id with dealership relation
      const userDealership = req['user_default_dealership'] as UserDealership;

      if (!userDealership) {
        return {} as Dealership;
      }

      // Fetch the dealership with its addresses
      const dealership = await this.dealershipRepository.findOne({
        where: {
          id: userDealership.dealership_id,
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
      const userDealership = req['user_default_dealership'] as UserDealership;
      let dealership: Dealership;
      // if user default dealership not found create one
      if (!userDealership?.dealership_id) {
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
        const newUserDealership = queryRunner.manager.merge(
          UserDealership,
          userDealership,
          { dealership_id: dealership.id },
        );

        await queryRunner.manager.save(UserDealership, newUserDealership);
      } else {
        // Check if a dealership exists (e.g., by email or another unique field)
        const existingDealership = await queryRunner.manager.findOne(
          Dealership,
          {
            where: {
              id: userDealership.dealership_id,
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
}
