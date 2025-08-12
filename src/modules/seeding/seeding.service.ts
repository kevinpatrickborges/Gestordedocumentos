import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { RoleType } from '../users/enums/role-type.enum';

@Injectable()
export class SeedingService implements OnModuleInit {
  private readonly logger = new Logger(SeedingService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    this.logger.log('Iniciando o processo de seeding do banco de dados...');
    await this.seedRoles();
    await this.seedAdminUser();
    this.logger.log('Seeding do banco de dados concluído.');
  }

  private async seedRoles() {
    const roles = await this.roleRepository.find();
    if (roles.length === 0) {
      this.logger.log('Nenhuma role encontrada. Criando roles padrão...');
      const adminRole = this.roleRepository.create({ name: RoleType.ADMIN, description: 'Administrador do sistema' });
      const userRole = this.roleRepository.create({ name: RoleType.USUARIO, description: 'Usuário padrão' });
      await this.roleRepository.save([adminRole, userRole]);
      this.logger.log('Roles padrão criadas com sucesso.');
    } else {
      this.logger.log('Roles já existem. Nenhuma ação necessária.');
    }
  }

  private async seedAdminUser() {
    const adminRole = await this.roleRepository.findOne({ where: { name: RoleType.ADMIN } });
    if (!adminRole) {
      this.logger.error('Role de Admin não encontrada. Não foi possível criar ou atualizar o usuário admin.');
      return;
    }

    const adminUser = await this.userRepository.findOne({ where: { usuario: 'admin' } });
    const hashedPassword = await bcrypt.hash('admin123', 12);

    if (adminUser) {
      this.logger.log('Usuário admin encontrado. Atualizando a senha...');
      adminUser.senha = hashedPassword;
      adminUser.role = adminRole;
      await this.userRepository.save(adminUser);
      this.logger.log('Usuário admin atualizado com sucesso.');
    } else {
      this.logger.log('Usuário admin não encontrado. Criando usuário admin...');
      const newAdminUser = this.userRepository.create({
        nome: 'Administrador',
        usuario: 'admin',
        senha: hashedPassword,
        ativo: true,
        role: adminRole,
      });
      await this.userRepository.save(newAdminUser);
      this.logger.log('Usuário admin criado com sucesso.');
    }
  }
}
