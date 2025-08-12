import { Role } from '../../domain/entities/role';
import { IRoleRepository } from '../../domain/repositories/role.repository.interface';
export declare class GetRolesUseCase {
    private readonly roleRepository;
    constructor(roleRepository: IRoleRepository);
    execute(): Promise<Role[]>;
}
