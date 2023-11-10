import { Injectable } from '@nestjs/common';
import { Usuario } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.senha === password) {
      return user;
    }
    return null;
  }

  async login(user: Usuario) {
    return {
      access_token: this.jwtService.sign(user),
    };
  }
}
