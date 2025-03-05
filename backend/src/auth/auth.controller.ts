import { Controller, Get, Post, Body, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { AuthGuard } from './auth.guard';
import { Request } from 'express';
import { CurrentUser } from './current-user.decorator';
import * as session from 'express-session';

/**
 * CustomRequest extends Express Request to include session.
 */
interface CustomRequest extends Request {
  session: session.Session & { userId?: string };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  async signup(@Body() dto: SignupDto): Promise<any> {
    return this.authService.signup(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: CustomRequest): Promise<any> {
    const user = await this.authService.login(dto);
    if (!user || !user._id) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // Assign authenticated user's ID to the session.
    req.session.userId = user._id.toString();
    // Save the session to ensure the cookie is set.
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => (err ? reject(err) : resolve()));
    });
    return { message: 'Login successful', user };
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Req() req: CustomRequest): Promise<any> {
    const sessionId = req.session ? req.session.id : '';
    return this.authService.logout(sessionId);
  }

  @Get('session')
  async getSession(@CurrentUser() userId: string): Promise<any> {
    if (!userId) {
      return { message: 'No active session.' };
    }
    return { message: 'Active session found.', userId };
  }
}
