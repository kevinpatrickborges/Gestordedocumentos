import { Injectable, Inject } from '@nestjs/common';
import { User } from '../../domain/entities/user';
import { IUserRepository, UserFilters } from '../../domain/repositories/user.repository.interface';
import { QueryUsersDto } from '../dto/query-users.dto';

@Injectable()
export class GetUsersUseCase {
  constructor(@Inject('IUserRepository') private readonly userRepository: IUserRepository) {}

  async execute(query: QueryUsersDto): Promise<User[]> {
    const filters: UserFilters = {
      nome: query.nome,
      usuario: query.usuario,
      ativo: query.ativo,
      roleId: query.roleId,
      includeDeleted: query.includeDeleted,
    };

    const page = query.page || 1;
    const limit = query.limit || 10;

    if (page && limit) {
      const result = await this.userRepository.findWithPagination(page, limit, filters);
      return result.users;
    }

    return this.userRepository.findAll(filters);
  }
}