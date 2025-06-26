import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { EntityManager } from 'typeorm';
import { IsUniqueConstraintInput } from './is-unique';

@ValidatorConstraint({ name: 'IsUniqueConstraint', async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly entityManager: EntityManager) {}

  async validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> {
    try {
      const { table, column }: IsUniqueConstraintInput =
        // eslint-disable-next-line no-unsafe-optional-chaining
        validationArguments?.constraints[0];
      const exist = await this.entityManager
        .getRepository(table)
        .createQueryBuilder(table)
        .where({ [column]: value })
        .getExists();
      return !exist;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  defaultMessage?(_args?: ValidationArguments): string {
    return `The ${_args?.property.toLowerCase()} has already been taken.`;
  }
}
