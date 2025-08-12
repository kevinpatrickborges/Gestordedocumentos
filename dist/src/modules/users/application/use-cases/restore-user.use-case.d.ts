import { User } from '../../domain/entities/user';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
export declare class RestoreUserUseCase {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    execute(id: number): Promise<User>;
}
