import { Role } from '../../src/modules/users/entities/role.entity';
import { DeepPartial } from 'typeorm';
export declare class RoleFactory {
    static build(data?: DeepPartial<Role>): DeepPartial<Role>;
}
