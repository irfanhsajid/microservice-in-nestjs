import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: 'Exists', async: true })
@Injectable()
export class IsExistsConstraint implements ValidatorConstraintInterface {
  constructor(private dataSource: DataSource) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const [EntityClass, field] = args.constraints;
    if (!value) return false;

    const repo = this.dataSource.getRepository(EntityClass);
    const record = await repo.findOne({
      where: { [field]: value },
    });
    return !!record;
  }

  defaultMessage(args: ValidationArguments): string {
    const [EntityClass, field] = args.constraints;
    return `${field} does not exist in ${EntityClass} table`;
  }
}
