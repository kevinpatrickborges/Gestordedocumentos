import { User } from '../../src/modules/users/entities/user.entity';
import { DeepPartial } from 'typeorm';
export declare class UserFactory {
    static build(data?: DeepPartial<User>): DeepPartial<User>;
}
