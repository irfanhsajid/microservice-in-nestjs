import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsArray,
  ValidateNested,
  IsOptional,
  IsBoolean,
  ValidationOptions,
  registerDecorator,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MileageType } from '../entities/vehicle-vins.entity';
import { ApiProperty } from '@nestjs/swagger';

// Custom validator to ensure only one boolean property is true
function OnlyOneBoolean(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'onlyOneBoolean',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: any) {
          const object = args.object;
          const booleans = [
            object.vehicle_diagnostics,
            object.electrical_issues,
            object.engine_light,
            object.unreported_accidents,
          ].filter((val) => val === true);
          return booleans.length <= 1; // Only one can be true
        },
        defaultMessage(args: any) {
          console.log(args);
          return 'Only one of vehicle_diagnostics, electrical_issues, engine_light, or unreported_accidents can be true at a time.';
        },
      },
    });
  };
}

// Custom validator for description field
function DescriptionRequiredIfBooleanTrue(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'descriptionRequiredIfBooleanTrue',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: any) {
          const object = args.object;
          const booleans = [
            object.vehicle_diagnostics,
            object.electrical_issues,
            object.engine_light,
            object.unreported_accidents,
          ];
          const hasTrueBoolean = booleans.some((val) => val === true);
          // If any boolean is true, description must not be empty
          if (hasTrueBoolean) {
            return typeof value === 'string' && value.trim().length > 0;
          }
          // If no booleans are true, description can be empty or undefined
          return true;
        },
        defaultMessage(args: any) {
          return 'Description is required when any of vehicle_diagnostics, electrical_issues, engine_light, or unreported_accidents is true.';
        },
      },
    });
  };
}

export class VehicleDiagnosticDto {
  @ApiProperty({ description: 'Indicates if vehicle diagnostics issue exists' })
  @IsOptional()
  @IsBoolean()
  @OnlyOneBoolean()
  vehicle_diagnostics?: boolean;

  @ApiProperty({ description: 'Indicates if electrical issues exist' })
  @IsOptional()
  @IsBoolean()
  @OnlyOneBoolean()
  electrical_issues?: boolean;

  @ApiProperty({ description: 'Indicates if engine light is on' })
  @IsOptional()
  @IsBoolean()
  @OnlyOneBoolean()
  engine_light?: boolean;

  @ApiProperty({ description: 'Indicates if there are unreported accidents' })
  @IsOptional()
  @IsBoolean()
  @OnlyOneBoolean()
  unreported_accidents?: boolean;

  @ApiProperty({ description: 'Description of the diagnostic issue' })
  @IsString()
  @DescriptionRequiredIfBooleanTrue()
  description: string;
}

export class CreateVehicleVinsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  vin_number: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  mileage: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(MileageType)
  mileage_type: MileageType;

  @ApiProperty({
    description: 'Array of vehicle diagnostic issues',
    type: [VehicleDiagnosticDto],
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VehicleDiagnosticDto)
  vehicle_diagnostics: VehicleDiagnosticDto[];
}
