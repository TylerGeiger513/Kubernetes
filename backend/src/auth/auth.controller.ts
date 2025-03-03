import { Controller, Post, Body, Session, Res, Req, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body, @Res() res: Response) {
    const { email, password, campus } = body;
    const user = await this.authService.signup(email, password, campus);
    if (!user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    res.json({ message: 'Signup successful' });
  }

  @Post('login')
  async login(@Body() body, @Session() session, @Res() res: Response) {
    const { email, password } = body;
    const user = await this.authService.login(email, password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    session.userId = user._id;
    res.json({ message: 'Login successful' });
  }

  @Post('logout')
  async logout(@Session() session, @Res() res: Response) {
    session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logout successful' });
    });
  }

  @Post('session')
  @UseGuards(AuthGuard)
  getSession(@Req() req: Request) {
    return { userId: req.session.userId };
  }
}
