import { registerDecorator, ValidationOptions } from 'class-validator';
import { IsExistsConstraint } from './is-exists-constraint';
import { IsMatchConstraint } from './is-match-constraint';

export function IsMatch(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsMatchConstraint,
    });
  };
}
