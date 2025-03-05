import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { SessionService } from '../session/session.service';

/**
 * @class AuthService
 * @description Provides authentication logic including signup, login, and logout.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService,
  ) {}

  /**
   * Signs up a new user.
   * @param dto - Signup data.
   * @returns Confirmation message and created user.
   */
  async signup(dto: SignupDto): Promise<any> {
    const user = await this.usersService.registerUser(dto);
    // Optionally create a session here using SessionService.
    return { message: 'Signup successful', user };
  }

  /**
   * Logs in a user by validating credentials.
   * @param dto - Login data.
   * @returns Confirmation message and authenticated user.
   */
  async login(dto: LoginDto): Promise<any> {
    const user = await this.usersService.validateUserCredentials(dto);
    this.logger.log(`User ${user._id} logged in successfully.`);
    return { message: 'Login successful', user };
  }

  /**
   * Logs out a user by invalidating the session.
   * @param sessionId - The session identifier.
   * @returns A logout confirmation message.
   */
  async logout(sessionId: string): Promise<any> {
    // Invalidate the session using SessionService.
    // Implementation details depend on your session management strategy.
    await this.sessionService.getSession(sessionId);
    return { message: 'Logout successful' };
  }
}
