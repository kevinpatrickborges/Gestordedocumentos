import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Render,
  Request,
  Response,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

// Use Cases
import {
  CreateUserUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
  GetUserByIdUseCase,
  GetUsersUseCase,
  RestoreUserUseCase,
  GetUserStatisticsUseCase,
  GetRolesUseCase,
} from './application/use-cases';

// DTOs
import { CreateUserDto } from './application/dto/create-user.dto';
import { UpdateUserDto } from './application/dto/update-user.dto';
import { QueryUsersDto } from './application/dto/query-users.dto';

// Guards and Decorators
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from './entities/user.entity';

// Mappers
import { UserMapper } from './infrastructure/mappers/user.mapper';
import { RoleMapper } from './infrastructure/mappers/role.mapper';

@ApiTags('Usuários')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly restoreUserUseCase: RestoreUserUseCase,
    private readonly getUserStatisticsUseCase: GetUserStatisticsUseCase,
    private readonly getRolesUseCase: GetRolesUseCase,
  ) {}

  @Get()
  @Render('usuarios/lista')
  @ApiOperation({ summary: 'Lista usuários (página web)' })
  async listPage(
    @Query() query: QueryUsersDto,
    @Request() req: ExpressRequest,
  ) {
    // Se for requisição AJAX/API, retorna JSON
    if (req.headers.accept?.includes('application/json')) {
      return this.findAll(query);
    }

    // Se for requisição web, renderiza página
    const users = await this.getUsersUseCase.execute(query);
    const roles = await this.getRolesUseCase.execute();
    const stats = await this.getUserStatisticsUseCase.execute();

    return {
      title: 'Usuários - SGC ITEP',
      users: users.map(user => UserMapper.toEntity(user)),
      roles: roles.map(role => RoleMapper.toEntity(role)),
      stats,
      query,
    };
  }

  @Get('api')
  @ApiOperation({ summary: 'Lista usuários com paginação e filtros' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'roleId', required: false, type: Number })
  @ApiQuery({ name: 'ativo', required: false, type: Boolean })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['nome', 'usuario', 'criadoEm', 'ultimoLogin'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiResponse({ status: 200, description: 'Lista de usuários' })
  async findAll(@Query() query: QueryUsersDto) {
    const users = await this.getUsersUseCase.execute(query);
    return users.map(user => UserMapper.toEntity(user));
  }

  @Get('novo')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Render('usuarios/novo')
  @ApiOperation({ summary: 'Renderiza página de criação de usuário' })
  async createPage() {
    const roles = await this.getRolesUseCase.execute();
    return {
      title: 'Novo Usuário - SGC ITEP',
      roles: roles.map(role => RoleMapper.toEntity(role)),
    };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Cria novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: User,
    @Request() req: ExpressRequest,
    @Response() res: ExpressResponse,
  ) {
    try {
      const user = await this.createUserUseCase.execute(createUserDto);
      const userEntity = UserMapper.toEntity(user);
      
      // Se for requisição AJAX/API, retorna JSON
      if (req.headers.accept?.includes('application/json')) {
        return res.status(201).json(userEntity);
      }
      
      // Se for requisição web, redireciona
      return res.redirect('/users?message=Usuário criado com sucesso');
    } catch (error) {
      if (req.headers.accept?.includes('application/json')) {
        return res.status(400).json({ message: error.message });
      }
      
      return res.redirect(`/users/novo?error=${encodeURIComponent(error.message)}`);
    }
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Obtém estatísticas dos usuários' })
  @ApiResponse({ status: 200, description: 'Estatísticas dos usuários' })
  async getStats() {
    return this.getUserStatisticsUseCase.execute();
  }

  @Get('roles')
  @ApiOperation({ summary: 'Lista todas as roles disponíveis' })
  @ApiResponse({ status: 200, description: 'Lista de roles' })
  async findAllRoles() {
    const roles = await this.getRolesUseCase.execute();
    return roles.map(role => RoleMapper.toEntity(role));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca usuário por ID' })
  @ApiResponse({ status: 200, description: 'Dados do usuário' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: ExpressRequest,
  ) {
    const user = await this.getUserByIdUseCase.execute(id);
    const userEntity = UserMapper.toEntity(user);
    
    // Se for requisição AJAX/API, retorna JSON
    if (req.headers.accept?.includes('application/json')) {
      return userEntity;
    }
    
    // Se for requisição web, renderiza página de detalhes
    return {
      title: `${userEntity.nome} - SGC ITEP`,
      user: userEntity,
    };
  }

  @Get(':id/detalhe')
  @Render('usuarios/detalhe')
  @ApiOperation({ summary: 'Renderiza página de detalhes do usuário' })
  async detailPage(@Param('id', ParseIntPipe) id: number) {
    const user = await this.getUserByIdUseCase.execute(id);
    const userEntity = UserMapper.toEntity(user);
    return {
      title: `${userEntity.nome} - SGC ITEP`,
      user: userEntity,
    };
  }

  @Get(':id/editar')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Render('usuarios/editar')
  @ApiOperation({ summary: 'Renderiza página de edição do usuário' })
  async editPage(@Param('id', ParseIntPipe) id: number) {
    const user = await this.getUserByIdUseCase.execute(id);
    const roles = await this.getRolesUseCase.execute();
    const userEntity = UserMapper.toEntity(user);
    return {
      title: `Editar ${userEntity.nome} - SGC ITEP`,
      user: userEntity,
      roles: roles.map(role => RoleMapper.toEntity(role)),
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
    @Request() req: ExpressRequest,
    @Response() res: ExpressResponse,
  ) {
    try {
      const user = await this.updateUserUseCase.execute(id, updateUserDto);
      const userEntity = UserMapper.toEntity(user);
      
      // Se for requisição AJAX/API, retorna JSON
      if (req.headers.accept?.includes('application/json')) {
        return res.json(userEntity);
      }
      
      // Se for requisição web, redireciona
      return res.redirect(`/users/${id}?message=Usuário atualizado com sucesso`);
    } catch (error) {
      if (req.headers.accept?.includes('application/json')) {
        return res.status(400).json({ message: error.message });
      }
      
      return res.redirect(`/users/${id}/editar?error=${encodeURIComponent(error.message)}`);
    }
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove usuário (soft delete)' })
  @ApiResponse({ status: 204, description: 'Usuário removido com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
    @Request() req: ExpressRequest,
    @Response() res: ExpressResponse,
  ) {
    try {
      await this.deleteUserUseCase.execute(id);
      
      // Se for requisição AJAX/API, retorna status 204
      if (req.headers.accept?.includes('application/json')) {
        return res.status(204).send();
      }
      
      // Se for requisição web, redireciona
      return res.redirect('/users?message=Usuário removido com sucesso');
    } catch (error) {
      if (req.headers.accept?.includes('application/json')) {
        return res.status(400).json({ message: error.message });
      }
      
      return res.redirect(`/users?error=${encodeURIComponent(error.message)}`);
    }
  }

  @Patch(':id/reativar')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Reativa usuário' })
  @ApiResponse({ status: 200, description: 'Usuário reativado com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async reactivate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
    @Request() req: ExpressRequest,
    @Response() res: ExpressResponse,
  ) {
    try {
      const user = await this.restoreUserUseCase.execute(id);
      const userEntity = UserMapper.toEntity(user);
      
      // Se for requisição AJAX/API, retorna JSON
      if (req.headers.accept?.includes('application/json')) {
        return res.json(userEntity);
      }
      
      // Se for requisição web, redireciona
      return res.redirect(`/users/${id}?message=Usuário reativado com sucesso`);
    } catch (error) {
      if (req.headers.accept?.includes('application/json')) {
        return res.status(400).json({ message: error.message });
      }
      
      return res.redirect(`/users?error=${encodeURIComponent(error.message)}`);
    }
  }

  @Get('perfil/meu')
  @Render('usuarios/perfil')
  @ApiOperation({ summary: 'Renderiza página do perfil do usuário logado' })
  async profilePage(@CurrentUser() currentUser: User) {
    const user = await this.getUserByIdUseCase.execute(currentUser.id);
    const userEntity = UserMapper.toEntity(user);
    return {
      title: 'Meu Perfil - SGC ITEP',
      user: userEntity,
      isOwnProfile: true,
    };
  }
}
