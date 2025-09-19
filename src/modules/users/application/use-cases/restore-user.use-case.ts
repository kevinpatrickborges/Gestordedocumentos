import { Injectable, Inject } from '@nestjs/common';
import { User } from '../../domain/entities/user';
import { UserId } from '../../domain/value-objects/user-id';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class RestoreUserUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: number): Promise<User> {
    const userId = new UserId(id);
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    if (!user.isDeleted) {
      throw new Error('Usuário não está deletado');
    }

    await this.userRepository.restore(userId);

    // Retornar o usuário atualizado
    const restoredUser = await this.userRepository.findById(userId);
    if (!restoredUser) {
      throw new Error('Erro ao restaurar usuário');
    }

    return restoredUser;
  }
}
