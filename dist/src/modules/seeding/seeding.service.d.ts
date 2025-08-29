import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
export declare class SeedingService implements OnModuleInit {
    private readonly userRepository;
    private readonly roleRepository;
    private readonly logger;
    constructor(userRepository: Repository<User>, roleRepository: Repository<Role>);
    onModuleInit(): Promise<void>;
    private updateExistingRoles;
    private seedRoles;
    private seedAdminUser;
}
