import { Resource } from 'src/app/common/interfaces/resource';
import { User } from '../entities/user.entity';

export class UserResource extends Resource<User> {
  toJSON(): unknown {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      avatar: this.avatar,
      status: this.status,
      accept_privacy: this.view_accept_privacy,
      account_type: this.account_type,
      created_at: this.created_at,
      updated_at: this.updated_at,
      email_verified_at: this.email_verified_at || null,
      profile_completed: this.profile_completed || null,
    };
  }
}
