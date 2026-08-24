// Maps an authenticated user's role to the dashboard route they land on.
export function getRoleRedirectPath(role) {
  switch (role) {
    case 'superadmin':
    case 'super_admin':
      return '/superadmin/dashboard';
    case 'owner':
    case 'manager':
    case 'staff':
      return '/tenant/dashboard';
    case 'customer':
      return '/';
    default:
      return '/tenant/dashboard';
  }
}
