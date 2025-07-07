import { Resource } from 'src/app/common/interfaces/resource';
import { User } from '../entities/user.entity';
import { UserDealership } from '../../dealership/entities/user-dealership.entity';
import { RoleHasPermissions } from '../../roles/entities/role_has_permissions.entity';
import { log } from 'handlebars';

export class UserResource extends Resource<User> {
  toJSON(): unknown {
    const role = this.user_dealerships?.find(
      (user_dealership: UserDealership) => user_dealership.is_default,
    )?.role;

    const permissions = role?.role_has_permissions?.map(
      (role_has_permission: RoleHasPermissions) => {
        return role_has_permission.permission;
      },
    );

    const dealership = this.user_dealerships?.find(
      (user_dealership: UserDealership) => user_dealership.is_default,
    )?.dealership;

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
      role: {
        id: role?.id,
        name: role?.name,
        status: role?.status,
      },
      permissions: permissions,
      dealership: {
        id: dealership?.id,
        name: dealership?.name,
        license_class: dealership?.license_class,
        business_type: dealership?.business_type,
      },
    };
  }
}
