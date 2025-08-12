import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { User } from '../../users/entities/user.entity';
declare const SessionStrategy_base: new (...args: any[]) => Strategy;
export declare class SessionStrategy extends SessionStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(req: Request): Promise<User>;
}
export {};
