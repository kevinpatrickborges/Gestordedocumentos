import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';

import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Auditoria } from '../audit/entities/auditoria.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';

export interface PaginatedUsers {
  users: any[]; // Objetos serializados sem métodos
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Auditoria)
    private readonly auditoriaRepository: Repository<Auditoria>,
  ) {}

  /**
   * Cria um novo usuário
   */
  async create(createUserDto: CreateUserDto, currentUser: User): Promise<User> {
    if (!currentUser.isAdmin()) {
      throw new ForbiddenException(
        'Apenas administradores podem criar usuários',
      );
    }

    // Verifica se usuario já existe
    const existingUser = await this.userRepository.findOne({
      where: { usuario: createUserDto.usuario },
    });

    if (existingUser) {
      throw new BadRequestException('Usuário já está em uso');
    }

    // Verifica se a role existe
    const role = await this.roleRepository.findOne({
      where: { id: createUserDto.roleId },
    });

    if (!role) {
      throw new BadRequestException('Role inválida');
    }

    const user = this.userRepository.create({
      ...createUserDto,
      role,
    });

    const savedUser = await this.userRepository.save(user);

    // Salva auditoria
    await this.saveAudit(
      currentUser.id,
      'CREATE',
      'USER',
      `Usuário criado: ${savedUser.usuario}`,
      { userId: savedUser.id },
    );

    this.logger.log(
      `Usuário criado: ${savedUser.usuario} por ${currentUser.usuario}`,
    );

    return this.findOne(savedUser.id);
  }

  /**
   * Lista usuários com paginação e filtros
   */
  async findAll(queryDto: QueryUsersDto): Promise<PaginatedUsers> {
    const {
      page = 1,
      limit = 10,
      search,
      roleId,
      ativo,
      sortBy = 'criadoEm',
      sortOrder = 'DESC',
    } = queryDto;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.desarquivamentos', 'desarquivamentos');

    // Filtros
    if (search) {
      queryBuilder.andWhere(
        '(user.nome ILIKE :search OR user.usuario ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (roleId) {
      queryBuilder.andWhere('user.roleId = :roleId', { roleId });
    }

    if (ativo !== undefined) {
      queryBuilder.andWhere('user.ativo = :ativo', { ativo });
    }

    // Ordenação
    const validSortFields = ['nome', 'usuario', 'criadoEm', 'ultimoLogin'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'criadoEm';
    queryBuilder.orderBy(`user.${sortField}`, sortOrder as 'ASC' | 'DESC');

    // Paginação
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map(user => user.serialize()),
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Busca usuário por ID
   */
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role', 'desarquivamentos'],
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  /**
   * Busca usuário por usuario
   */
  async findByUsuario(usuario: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { usuario },
      relations: ['role'],
    });
  }

  /**
   * Atualiza usuário
   */
  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    currentUser: User,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verifica permissões
    if (!currentUser.isAdmin() && currentUser.id !== id) {
      throw new ForbiddenException(
        'Você só pode editar seu próprio perfil ou ser administrador',
      );
    }

    // Apenas admins podem alterar role e status ativo
    if (!currentUser.isAdmin()) {
      delete updateUserDto.roleId;
      delete updateUserDto.ativo;
    }

    // Verifica se usuario já existe (se estiver sendo alterado)
    if (updateUserDto.usuario && updateUserDto.usuario !== user.usuario) {
      const existingUser = await this.userRepository.findOne({
        where: { usuario: updateUserDto.usuario },
      });

      if (existingUser) {
        throw new BadRequestException('Usuário já está em uso');
      }
    }

    // Verifica se a role existe (se estiver sendo alterada)
    if (updateUserDto.roleId) {
      const role = await this.roleRepository.findOne({
        where: { id: updateUserDto.roleId },
      });

      if (!role) {
        throw new BadRequestException('Role inválida');
      }
    }

    // Atualiza os campos
    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    // Salva auditoria
    await this.saveAudit(
      currentUser.id,
      'UPDATE',
      'USER',
      `Usuário atualizado: ${updatedUser.usuario}`,
      { userId: updatedUser.id, changes: updateUserDto },
    );

    this.logger.log(
      `Usuário atualizado: ${updatedUser.usuario} por ${currentUser.usuario}`,
    );

    return this.findOne(updatedUser.id);
  }

  /**
   * Remove usuário (soft delete)
   */
  async remove(id: number, currentUser: User): Promise<void> {
    if (!currentUser.isAdmin()) {
      throw new ForbiddenException(
        'Apenas administradores podem remover usuários',
      );
    }

    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.id === currentUser.id) {
      throw new BadRequestException('Você não pode remover sua própria conta');
    }

    // Soft delete - apenas desativa o usuário
    user.ativo = false;
    await this.userRepository.save(user);

    // Salva auditoria
    await this.saveAudit(
      currentUser.id,
      'DELETE',
      'USER',
      `Usuário removido: ${user.usuario}`,
      { userId: user.id },
    );

    this.logger.log(
      `Usuário removido: ${user.usuario} por ${currentUser.usuario}`,
    );
  }

  /**
   * Reativa usuário
   */
  async reactivate(id: number, currentUser: User): Promise<User> {
    if (!currentUser.isAdmin()) {
      throw new ForbiddenException(
        'Apenas administradores podem reativar usuários',
      );
    }

    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    user.ativo = true;
    user.tentativasLogin = 0;
    user.bloqueadoAte = null;

    const reactivatedUser = await this.userRepository.save(user);

    // Salva auditoria
    await this.saveAudit(
      currentUser.id,
      'UPDATE',
      'USER',
      `Usuário reativado: ${reactivatedUser.usuario}`,
      { userId: reactivatedUser.id },
    );

    this.logger.log(
      `Usuário reativado: ${reactivatedUser.usuario} por ${currentUser.usuario}`,
    );

    return this.findOne(reactivatedUser.id);
  }

  /**
   * Lista todas as roles disponíveis
   */
  async findAllRoles(): Promise<Role[]> {
    return this.roleRepository.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Obtém estatísticas dos usuários
   */
  async getStats(): Promise<{
    total: number;
    ativos: number;
    inativos: number;
    bloqueados: number;
    porRole: { role: string; count: number }[];
  }> {
    const total = await this.userRepository.count();
    const ativos = await this.userRepository.count({ where: { ativo: true } });
    const inativos = await this.userRepository.count({
      where: { ativo: false },
    });

    const bloqueados = await this.userRepository
      .createQueryBuilder('user')
      .where('user.bloqueadoAte > :now', { now: new Date() })
      .getCount();

    const porRole = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.role', 'role')
      .select('role.name', 'role')
      .addSelect('COUNT(user.id)', 'count')
      .groupBy('role.name')
      .getRawMany();

    return {
      total,
      ativos,
      inativos,
      bloqueados,
      porRole: porRole.map(item => ({
        role: item.role || 'Sem role',
        count: parseInt(item.count),
      })),
    };
  }

  /**
   * Salva auditoria
   */
  private async saveAudit(
    userId: number,
    action: string,
    resource: string,
    details: string,
    data?: any,
  ): Promise<void> {
    try {
      const auditData = Auditoria.createResourceAudit(
        userId,
        action as any,
        resource as any,
        0, // resourceId - usando 0 como padrão
        { details, data }, // details como objeto
        'unknown', // ipAddress - usando 'unknown' como padrão
        'unknown', // userAgent - usando 'unknown' como padrão
      );
      const audit = this.auditoriaRepository.create(auditData);
      await this.auditoriaRepository.save(audit);
    } catch (error) {
      this.logger.error(`Erro ao salvar auditoria: ${error.message}`);
    }
  }
}
