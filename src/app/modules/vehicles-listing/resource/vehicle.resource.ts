import { Resource } from 'src/app/common/interfaces/resource';
import { Vehicle } from '../entities/vehicles.entity';

export class VehicleResource extends Resource<Vehicle> {
  toJSON(): unknown {
    return {};
  }
}
