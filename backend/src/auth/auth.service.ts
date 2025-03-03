import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async signup(email: string, password: string, campus: string) {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) return null;
    return this.usersService.createUser(email, password, campus);
  }

  async login(email: string, password: string) {
    return this.usersService.validatePassword(email, password);
  }
}
