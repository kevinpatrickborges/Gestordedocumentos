import { User } from '../../domain/entities/user';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { IRoleRepository } from '../../domain/repositories/role.repository.interface';
import { UpdateUserDto } from '../dto/update-user.dto';
export declare class UpdateUserUseCase {
    private readonly userRepository;
    private readonly roleRepository;
    constructor(userRepository: IUserRepository, roleRepository: IRoleRepository);
    execute(id: number, dto: UpdateUserDto): Promise<User>;
}
