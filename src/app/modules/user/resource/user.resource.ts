import { Resource } from 'src/app/common/interfaces/resource';
import { User } from '../entities/user.entity';

export class UserResource extends Resource<User> {
  toJSON(): unknown {
    return {
      id: this.id,
      email: this.email,
      first_name: this.first_name,
      last_name: this.last_name,
      avatar: this.avatar,
      status: this.status,
      have_dealership: this.have_dealership,
      website: this.website,
      license_class: this.license_class,
      view_accept_privacy: this.view_accept_privacy,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}
