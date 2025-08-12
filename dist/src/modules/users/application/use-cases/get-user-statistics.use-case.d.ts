import { IUserRepository, UserStatistics } from '../../domain/repositories/user.repository.interface';
export declare class GetUserStatisticsUseCase {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    execute(): Promise<UserStatistics>;
}
