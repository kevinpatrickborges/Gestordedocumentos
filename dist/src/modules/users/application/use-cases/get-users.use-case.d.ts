import { User } from '../../domain/entities/user';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { QueryUsersDto } from '../dto/query-users.dto';
export declare class GetUsersUseCase {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    execute(query: QueryUsersDto): Promise<User[]>;
}
