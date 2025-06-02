import { Resource } from 'src/app/common/interfaces/resource';
import { User } from '../entities/user.entity';

export class UserResource extends Resource<User> {
  toJSON(): unknown {
    return {
      id: this.id,
      email: this.email,
      first_name: this.first_name,
      last_name: this.last_name,
    };
  }
}
