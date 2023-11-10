import { SetMetadata } from '@nestjs/common';
import { TipoUsuario } from '../users/user';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: TipoUsuario[]) => SetMetadata(ROLES_KEY, roles);
