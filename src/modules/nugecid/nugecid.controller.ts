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
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  Res,
  Req,
  Logger,
  BadRequestException,
  Header,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { Response, Request } from 'express';

// Use Cases
import {
  CreateDesarquivamentoUseCase,
  FindAllDesarquivamentosUseCase,
  FindDesarquivamentoByIdUseCase,
  UpdateDesarquivamentoUseCase,
  DeleteDesarquivamentoUseCase,
  RestoreDesarquivamentoUseCase,
} from './application/use-cases';

// DTOs
import { CreateDesarquivamentoDto } from './dto/create-desarquivamento.dto';
import { UpdateDesarquivamentoDto } from './dto/update-desarquivamento.dto';
import { QueryDesarquivamentoDto } from './dto/query-desarquivamento.dto';
import { CreateDesarquivamentoCommentDto } from './dto/create-comment.dto';

// New Services
import { NugecidImportService } from './nugecid-import.service';
import { NugecidStatsService } from './nugecid-stats.service';
import { NugecidPdfService } from './nugecid-pdf.service';
import { NugecidExportService } from './nugecid-export.service';
import { NugecidService } from './nugecid.service';

// Guards and Decorators
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { RoleType } from '../users/enums/role-type.enum';

@ApiTags('NUGECID - Desarquivamentos')
@Controller('nugecid')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NugecidController {
  private readonly logger = new Logger(NugecidController.name);

  constructor(
    private readonly createDesarquivamentoUseCase: CreateDesarquivamentoUseCase,
    private readonly findAllDesarquivamentosUseCase: FindAllDesarquivamentosUseCase,
    private readonly findDesarquivamentoByIdUseCase: FindDesarquivamentoByIdUseCase,
    private readonly updateDesarquivamentoUseCase: UpdateDesarquivamentoUseCase,
    private readonly deleteDesarquivamentoUseCase: DeleteDesarquivamentoUseCase,
    private readonly restoreDesarquivamentoUseCase: RestoreDesarquivamentoUseCase,
    private readonly nugecidImportService: NugecidImportService,
    private readonly nugecidStatsService: NugecidStatsService,
    private readonly nugecidPdfService: NugecidPdfService,
    private readonly nugecidExportService: NugecidExportService,
    private readonly nugecidService: NugecidService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova solicitação de desarquivamento' })
  @ApiResponse({
    status: 201,
    description: 'Desarquivamento criado com sucesso',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDesarquivamentoDto: CreateDesarquivamentoDto,
    @CurrentUser() currentUser: User,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.createDesarquivamentoUseCase.execute({
      ...createDesarquivamentoDto,
      criadoPorId: currentUser.id,
    });

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Desarquivamento criado com sucesso',
      data: result,
    });
  }

  @Post('import')
  @ApiOperation({ summary: 'Importar desarquivamentos de planilha Excel' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Arquivo Excel com desarquivamentos',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  async importDesarquivamentos(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser: User,
    @Res() res: Response,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Arquivo não enviado. Por favor, envie um arquivo Excel.',
      );
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException(
        'O arquivo enviado está vazio. Verifique se o arquivo Excel tem dados.',
      );
    }

    this.logger.log(
      `[${new Date().toISOString()}] 📁 Importando arquivo: ${file.originalname} (${file.size} bytes)`,
    );

    const result = await this.nugecidImportService.importFromXLSX(
      file,
      currentUser,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: `Importação concluída: ${result.successCount} de ${result.totalRows} registros importados com sucesso.`,
      data: result,
    });
  }

  // Alias de compatibilidade: alguns clientes chamam /api/nugecid/import-desarquivamentos
  @Post('import-desarquivamentos')
  @ApiOperation({
    summary: 'Importar desarquivamentos (alias compatível com rotas legadas)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Arquivo Excel com desarquivamentos',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  async importDesarquivamentosAlias(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser: User,
    @Res() res: Response,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Arquivo nǜo enviado. Por favor, envie um arquivo Excel.',
      );
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException(
        'O arquivo enviado estǭ vazio. Verifique se o arquivo Excel tem dados.',
      );
    }

    this.logger.log(
      `[${new Date().toISOString()}] Alias import: ${file.originalname} (${file.size} bytes)`,
    );

    const result = await this.nugecidImportService.importFromXLSX(
      file,
      currentUser,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: `Importa��ǜo conclu��da: ${result.successCount} de ${result.totalRows} registros importados com sucesso.`,
      data: result,
    });
  }

  @Post('import-registros')
  @ApiOperation({ summary: 'Importar registros de um arquivo .xlsx ou .csv' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'Arquivo (.xlsx ou .csv) contendo os registros para importação',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async importRegistros(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser: User,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Nenhum arquivo enviado. Por favor, anexe um arquivo .xlsx ou .csv.',
      );
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException(
        'O arquivo enviado está vazio. Verifique se o arquivo Excel tem dados.',
      );
    }

    this.logger.log(
      `[${new Date().toISOString()}] 📁 Importando registros: ${file.originalname} (${file.size} bytes)`,
    );

    const result = await this.nugecidImportService.importRegistrosFromXLSX(
      file,
      currentUser,
    );

    return {
      success: true,
      message: `Importação concluída: ${result.successCount} de ${result.totalRows} registros importados com sucesso.`,
      data: result,
    };
  }

  @Get(':id/termo')
  @ApiOperation({ summary: 'Gerar termo de entrega de desarquivamento em PDF' })
  @ApiParam({
    name: 'id',
    description: 'ID do desarquivamento',
    type: 'number',
  })
  @ApiBearerAuth()
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename=termo_de_entrega.pdf')
  async getTermoDeEntrega(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
    @CurrentUser() currentUser: User,
  ) {
    const desarquivamento = await this.findDesarquivamentoByIdUseCase.execute({
      id,
      userId: currentUser.id,
      userRoles: [currentUser.role?.name || 'USER'],
    });
    const buffer = await this.nugecidPdfService.generatePdf(
      desarquivamento as any,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=termo_de_entrega_${id}.pdf`,
    );
    res.send(buffer);
  }

  @Get()
  @Roles(RoleType.ADMIN, RoleType.USUARIO)
  @ApiOperation({ summary: 'Listar desarquivamentos com filtros e paginação' })
  @ApiQuery({ type: QueryDesarquivamentoDto })
  @ApiBearerAuth()
  async findAll(
    @Query() queryDto: QueryDesarquivamentoDto,
    @CurrentUser() currentUser: User,
  ) {
    // Mapear Query DTO -> filtros esperados pelo use case/repositório
    const filters = {
      search: queryDto.search,
      // Suporte a múltiplos status
      statusList: Array.isArray(queryDto.status) ? queryDto.status : undefined,
      status: Array.isArray(queryDto.status)
        ? undefined
        : (queryDto as any).status,
      tipoDesarquivamento: Array.isArray(queryDto.tipoDesarquivamento)
        ? queryDto.tipoDesarquivamento[0]
        : (queryDto as any).tipoDesarquivamento,
      criadoPorId: (queryDto as any).usuarioId,
      responsavelId: (queryDto as any).responsavelId,
      urgente: (queryDto as any).urgente,
      dataInicio: (queryDto as any).startDate
        ? new Date((queryDto as any).startDate as any)
        : (queryDto as any).dataInicio
          ? new Date((queryDto as any).dataInicio as any)
          : undefined,
      dataFim: (queryDto as any).endDate
        ? new Date((queryDto as any).endDate as any)
        : (queryDto as any).dataFim
          ? new Date((queryDto as any).dataFim as any)
          : undefined,
      incluirExcluidos: (queryDto as any).incluirExcluidos || false,
    };

    const result = await this.findAllDesarquivamentosUseCase.execute({
      page: queryDto.page,
      limit: queryDto.limit,
      sortBy: (queryDto as any).sortBy,
      sortOrder: (queryDto as any).sortOrder,
      filters,
      userId: currentUser.id,
      userRoles: [currentUser.role?.name || 'USER'],
    });

    return {
      success: true,
      data: result.data,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  @Get('lixeira')
  @Roles(RoleType.ADMIN, RoleType.USUARIO)
  @ApiOperation({ summary: 'Listar desarquivamentos excluídos (lixeira)' })
  @ApiQuery({ type: QueryDesarquivamentoDto })
  @ApiBearerAuth()
  async findDeleted(
    @Query() queryDto: QueryDesarquivamentoDto,
    @CurrentUser() currentUser: User,
    @Req() req: any,
  ) {
    const timestamp = new Date().toISOString();

    // Log detalhado dos parâmetros recebidos para debug
    this.logger.log(
      `[${timestamp}] 🗑️ Buscando itens da lixeira - Usuário: ${currentUser.usuario}`,
    );
    this.logger.log(
      `[${timestamp}] 📋 Query params recebidos:`,
      JSON.stringify(req.query, null, 2),
    );
    this.logger.log(
      `[${timestamp}] 📋 DTO validado:`,
      JSON.stringify(queryDto, null, 2),
    );

    const filters = {
      search: queryDto.search,
      statusList: Array.isArray(queryDto.status) ? queryDto.status : undefined,
      status: Array.isArray(queryDto.status)
        ? undefined
        : (queryDto as any).status,
      tipoDesarquivamento: Array.isArray(queryDto.tipoDesarquivamento)
        ? queryDto.tipoDesarquivamento[0]
        : (queryDto as any).tipoDesarquivamento,
      criadoPorId: (queryDto as any).usuarioId,
      responsavelId: (queryDto as any).responsavelId,
      urgente: (queryDto as any).urgente,
      dataInicio: (queryDto as any).startDate
        ? new Date((queryDto as any).startDate as any)
        : (queryDto as any).dataInicio
          ? new Date((queryDto as any).dataInicio as any)
          : undefined,
      dataFim: (queryDto as any).endDate
        ? new Date((queryDto as any).endDate as any)
        : (queryDto as any).dataFim
          ? new Date((queryDto as any).dataFim as any)
          : undefined,
      incluirExcluidos: true,
    };

    const result = await this.findAllDesarquivamentosUseCase.execute({
      page: queryDto.page,
      limit: queryDto.limit,
      sortBy: (queryDto as any).sortBy,
      sortOrder: (queryDto as any).sortOrder,
      filters,
      userId: currentUser.id,
      userRoles: [currentUser.role?.name || 'USER'],
    });

    // Filtra apenas os itens que foram excluídos (têm deletedAt)
    const deletedItems = result.data.filter(item => item.deletedAt);

    this.logger.log(
      `[${timestamp}] 📊 Encontrados ${deletedItems.length} itens na lixeira`,
    );

    return {
      success: true,
      data: deletedItems,
      meta: {
        page: result.page,
        limit: result.limit,
        total: deletedItems.length,
        totalPages: Math.ceil(deletedItems.length / result.limit),
      },
    };
  }

  @Patch('lixeira/:id/restaurar')
  @Roles(RoleType.ADMIN, RoleType.USUARIO)
  @ApiOperation({ summary: 'Restaurar desarquivamento da lixeira' })
  @ApiBearerAuth()
  async restore(@Param('id') id: string, @CurrentUser() currentUser: User) {
    const timestamp = new Date().toISOString();
    this.logger.log(
      `[${timestamp}] 🔄 Iniciando restauração - ID: ${id}, Usuário: ${currentUser.usuario}`,
    );

    try {
      const result = await this.restoreDesarquivamentoUseCase.execute({
        id: Number(id),
        userId: currentUser.id,
        userRoles: [currentUser.role?.name || 'USER'],
      });

      this.logger.log(
        `[${timestamp}] ✅ Desarquivamento restaurado com sucesso - ID: ${id}`,
      );

      return {
        success: true,
        message: 'Desarquivamento restaurado com sucesso',
        data: result,
        restoredAt: timestamp,
        restoredBy: currentUser.usuario,
      };
    } catch (error) {
      this.logger.error(
        `[${timestamp}] ❌ Erro ao restaurar desarquivamento - ID: ${id}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Obter estatísticas do dashboard' })
  @Roles(RoleType.ADMIN, RoleType.USUARIO)
  @ApiBearerAuth()
  async getDashboard() {
    const stats = await this.nugecidStatsService.getDashboardStats();

    return {
      success: true,
      data: stats,
    };
  }

  @Delete('lixeira/:id/permanente')
  @Roles(RoleType.ADMIN)
  @ApiOperation({
    summary:
      'Excluir permanentemente desarquivamento da lixeira (IRREVERSÍVEL)',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async hardDelete(
    @Param('id') idParam: string,
    @CurrentUser() currentUser: User,
  ) {
    const timestamp = new Date().toISOString();
    this.logger.log(
      `[${timestamp}] 🔥 EXCLUSÃO PERMANENTE SOLICITADA - ID: ${idParam}, Usuário: ${currentUser.usuario}`,
    );

    // Reutilizar a mesma validação de ID do método remove
    let id: number;
    try {
      const cleanId = idParam.trim();
      if (!/^\d+$/.test(cleanId)) {
        throw new BadRequestException(
          'ID inválido. Deve ser um número inteiro.',
        );
      }
      id = parseInt(cleanId, 10);
    } catch (error) {
      throw new BadRequestException(
        'ID inválido. Deve ser um número inteiro positivo.',
      );
    }

    try {
      const result = await this.deleteDesarquivamentoUseCase.execute({
        id,
        userId: currentUser.id,
        userRoles: [currentUser.role?.name || 'USER'],
        permanent: true,
      });

      return {
        success: true,
        message: 'Desarquivamento excluído permanentemente',
        data: result,
      };
    } catch (error) {
      this.logger.error(
        `[${new Date().toISOString()}] ❌ Erro exclusão permanente - ID: ${id}`,
        error.stack,
      );
      throw new BadRequestException(
        error.message || 'Erro ao excluir permanentemente',
      );
    }
  }

  @Get('export')
  @ApiOperation({ summary: 'Exportar desarquivamentos para Excel' })
  @ApiQuery({ type: QueryDesarquivamentoDto })
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  async exportToExcel(
    @Query() queryDto: QueryDesarquivamentoDto,
    @CurrentUser() currentUser: User,
    @Res() res: Response,
  ) {
    const buffer = await this.nugecidExportService.exportToExcel(
      queryDto,
      currentUser,
    );
    const fileName = `desarquivamentos_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(buffer);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter desarquivamento por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID do desarquivamento',
    type: 'integer',
  })
  @ApiBearerAuth()
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
  ) {
    const result = await this.findDesarquivamentoByIdUseCase.execute({
      id,
      userId: currentUser.id,
      userRoles: [currentUser.role?.name || 'USER'],
    });

    return {
      success: true,
      data: result,
    };
  }

  @Get('barcode/:codigo')
  @ApiOperation({ summary: 'Obter desarquivamento por código de barras' })
  @ApiParam({
    name: 'codigo',
    description: 'Código de barras do desarquivamento',
  })
  @ApiBearerAuth()
  async findByBarcode(
    @Param('codigo') codigo: string,
    @CurrentUser() currentUser: User,
  ) {
    const result = await this.findAllDesarquivamentosUseCase.execute({
      filters: { codigoBarras: codigo },
      limit: 1,
      page: 1,
      userId: currentUser.id,
      userRoles: [currentUser.role?.name || 'USER'],
    });

    if (result.data.length === 0) {
      throw new NotFoundException('Desarquivamento não encontrado');
    }

    return {
      success: true,
      data: result.data[0],
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar desarquivamento' })
  @ApiParam({
    name: 'id',
    description: 'ID do desarquivamento',
    type: 'integer',
  })
  @ApiBearerAuth()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDesarquivamentoDto: UpdateDesarquivamentoDto,
    @CurrentUser() currentUser: User,
  ) {
    try {
      const result = await this.updateDesarquivamentoUseCase.execute({
        id,
        ...updateDesarquivamentoDto,
        userId: currentUser.id,
        userRoles: [currentUser.role?.name || 'USER'],
      });

      return {
        success: true,
        message: 'Desarquivamento atualizado com sucesso',
        data: result,
      };
    } catch (error) {
      // Normaliza erros conhecidos para não retornar 500 indevidamente
      const msg = (error?.message || '').toString();
      if (msg.includes('Acesso negado')) {
        throw new ForbiddenException(
          'Você não tem permissão para editar este desarquivamento',
        );
      }
      if (msg.includes('não encontrado') || msg.includes('no encontrado')) {
        throw new NotFoundException('Desarquivamento não encontrado');
      }
      if (
        msg.toLowerCase().includes('status inv') ||
        msg.toLowerCase().includes('id deve ser')
      ) {
        throw new BadRequestException(msg);
      }
      throw new BadRequestException(msg || 'Erro ao atualizar desarquivamento');
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover desarquivamento' })
  @ApiParam({
    name: 'id',
    description: 'ID do desarquivamento',
    type: 'integer',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') idParam: string, @CurrentUser() currentUser: User) {
    const timestamp = new Date().toISOString();
    this.logger.log(
      `[${timestamp}] [NugecidController] EXCLUSÃO INICIADA - ID param: '${idParam}', Usuário: ${currentUser?.id} (${currentUser?.usuario}), Tipo: SOFT DELETE`,
    );

    // Validar se o ID é um número válido (não UUID)
    let id: number;
    try {
      const cleanId = idParam.trim();

      // Verificar se é um UUID (padrão: 8-4-4-4-12 caracteres hexadecimais)
      const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidPattern.test(cleanId)) {
        this.logger.error(
          `[${timestamp}] [NugecidController] ❌ UUID DETECTADO: '${idParam}' - Este endpoint espera um ID numérico`,
        );
        throw new BadRequestException(
          `ID inválido: '${idParam}'. ` +
            `Detectado UUID, mas este endpoint espera um ID numérico (ex: 1, 2, 3...). ` +
            `Verifique se você está usando o ID correto do desarquivamento.`,
        );
      }

      // Verificar se contém apenas dígitos
      if (!/^\d+$/.test(cleanId)) {
        this.logger.error(
          `[${timestamp}] [NugecidController] ❌ ID INVÁLIDO - contém caracteres não numéricos: '${idParam}'`,
        );
        throw new BadRequestException(
          `ID deve conter apenas números. Recebido: '${idParam}'. ` +
            `Formato esperado: número inteiro positivo (ex: 1, 2, 3...).`,
        );
      }

      id = parseInt(cleanId, 10);
      if (isNaN(id) || id <= 0) {
        this.logger.error(
          `[${timestamp}] [NugecidController] ❌ ID INVÁLIDO - não é um número positivo: '${idParam}'`,
        );
        throw new BadRequestException(
          `ID inválido: '${idParam}'. Deve ser um número inteiro positivo maior que zero.`,
        );
      }

      this.logger.log(
        `[${timestamp}] [NugecidController] ✅ ID validado com sucesso: ${id}`,
      );
    } catch (error) {
      // Se já é uma BadRequestException, re-throw
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Erro genérico de conversão
      this.logger.error(
        `[${timestamp}] [NugecidController] ❌ ERRO NA VALIDAÇÃO DO ID: '${idParam}' - ${error.message}`,
      );
      throw new BadRequestException(
        `ID inválido: '${idParam}'. Deve ser um número inteiro positivo. ` +
          `Se você está tentando usar um UUID, verifique se está usando o endpoint correto.`,
      );
    }

    try {
      const result = await this.deleteDesarquivamentoUseCase.execute({
        id,
        userId: currentUser.id,
        userRoles: [currentUser.role?.name || 'USER'],
        permanent: false,
      });

      const completedTimestamp = new Date().toISOString();
      this.logger.log(
        `[${completedTimestamp}] [NugecidController] ✅ EXCLUSÃO CONCLUÍDA COM SUCESSO - ID: ${id} foi EXCLUÍDO DO BANCO DE DADOS (soft delete), Usuário: ${currentUser?.id}`,
      );

      return {
        success: true,
        message: 'Desarquivamento removido com sucesso',
        data: {
          id,
          deletedAt: completedTimestamp,
          deletedBy: currentUser.id,
          type: 'soft_delete',
        },
      };
    } catch (error) {
      const errorTimestamp = new Date().toISOString();
      this.logger.error(
        `[${errorTimestamp}] [NugecidController] ❌ ERRO NA EXCLUSÃO - ID: ${id}, Usuário: ${currentUser?.id}, Erro: ${error.message}`,
      );

      // Melhorar mensagens de erro para o usuário
      if (error.message.includes('Acesso negado')) {
        throw new ForbiddenException(
          'Você não tem permissão para excluir este desarquivamento',
        );
      }

      if (
        error.message.includes('ID') &&
        error.message.includes('não encontrado')
      ) {
        throw new NotFoundException('Desarquivamento não encontrado');
      }

      if (error.message.includes('em andamento')) {
        throw new BadRequestException(
          'Não é possível excluir desarquivamento em andamento',
        );
      }

      if (error.message.includes('concluídos')) {
        throw new ForbiddenException(
          'Apenas administradores podem excluir desarquivamentos concluídos',
        );
      }

      // Erro genérico
      throw new BadRequestException(
        error.message || 'Erro ao excluir desarquivamento',
      );
    }
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Lista comentários do desarquivamento' })
  @ApiResponse({
    status: 200,
    description: 'Comentários retornados com sucesso',
  })
  async listComments(@Param('id', ParseIntPipe) id: number) {
    const comments = await this.nugecidService.listComments(id);
    return {
      success: true,
      data: comments.map(comment => ({
        id: comment.id,
        comment: comment.comment,
        authorName: comment.authorName,
        userId: comment.userId,
        createdAt: comment.createdAt,
        user: comment.user
          ? {
              id: comment.user.id,
              nome: comment.user.nome,
              usuario: comment.user.usuario,
            }
          : null,
      })),
    };
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Adiciona um comentário ao desarquivamento' })
  @ApiResponse({ status: 201, description: 'Comentário criado com sucesso' })
  async addComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateDesarquivamentoCommentDto,
    @CurrentUser() currentUser: User,
  ) {
    const saved = await this.nugecidService.addComment(
      id,
      currentUser,
      body.comment,
    );
    return {
      success: true,
      data: {
        id: saved.id,
        comment: saved.comment,
        authorName: saved.authorName,
        userId: saved.userId,
        createdAt: saved.createdAt,
        user: saved.user
          ? {
              id: saved.user.id,
              nome: saved.user.nome,
              usuario: saved.user.usuario,
            }
          : null,
      },
    };
  }
}
