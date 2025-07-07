import { registerDecorator, ValidationOptions } from 'class-validator';
import { IsExistsConstraint } from './is-exists-contraint';

export function IsExists(
  EntityClass: any,
  field: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [EntityClass, field],
      validator: IsExistsConstraint,
    });
  };
}
