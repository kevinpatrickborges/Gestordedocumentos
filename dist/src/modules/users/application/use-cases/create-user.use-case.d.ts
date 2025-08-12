import { User } from '../../domain/entities/user';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { IRoleRepository } from '../../domain/repositories/role.repository.interface';
import { CreateUserDto } from '../dto/create-user.dto';
export declare class CreateUserUseCase {
    private readonly userRepository;
    private readonly roleRepository;
    constructor(userRepository: IUserRepository, roleRepository: IRoleRepository);
    execute(dto: CreateUserDto): Promise<User>;
}
