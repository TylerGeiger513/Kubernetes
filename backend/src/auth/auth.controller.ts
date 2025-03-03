import { Controller, Post, Body, Session, Req, UseGuards, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { AuthGuard } from './auth.guard';
import { Request } from 'express';
import { CustomSession } from '../types/custom-session';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }
    private readonly logger = new Logger(AuthController.name);


    @Post('signup')
    async signup(@Body() signupDto: SignupDto) {
        await this.authService.signup(signupDto);
        return { message: 'Signup successful' };
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto, @Session() session: CustomSession) {
        try {
            const user = await this.authService.login(loginDto);
            session.userId = user._id.toString();

            // Wait for session to save (optional but recommended)
            await new Promise<void>((resolve, reject) => {
                session.save((err) => (err ? reject(err) : resolve()));
            });

            return { message: 'Login successful' };
        } catch (error) {
            this.logger.error('Error during login', error);
            throw error;
        }
    }


    @Post('logout')
    async logout(@Session() session: CustomSession) {
        return new Promise((resolve, reject) => {
            session.destroy((err: Error) => {
                if (err) {
                    return reject({ message: 'Logout failed' });
                }
                resolve({ message: 'Logout successful' });
            });
        });
    }

    @Post('session')
    @UseGuards(AuthGuard)
    getSession(@Req() req: Request) {
        this.logger.log('Session:', req.session);
        return { userId: (req.session as CustomSession).userId };
    }
}
