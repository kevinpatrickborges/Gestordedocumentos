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
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as XLSX from 'xlsx';

// Use Cases
import {
  CreateDesarquivamentoUseCase,
  FindAllDesarquivamentosUseCase,
  FindDesarquivamentoByIdUseCase,
  UpdateDesarquivamentoUseCase,
  DeleteDesarquivamentoUseCase,
  RestoreDesarquivamentoUseCase,
  GenerateTermoEntregaUseCase,
  GetDashboardStatsUseCase,
  ImportDesarquivamentoUseCase,
  ImportRegistrosUseCase,
} from './application/use-cases';

// DTOs
import { CreateDesarquivamentoDto } from './dto/create-desarquivamento.dto';
import { UpdateDesarquivamentoDto } from './dto/update-desarquivamento.dto';
import { QueryDesarquivamentoDto } from './dto/query-desarquivamento.dto';
import { ImportResultDto } from './dto/import-result.dto';
import { ImportRegistroDto } from './dto/import-registro.dto';

// Entities
import { Desarquivamento } from './entities/desarquivamento.entity';

// Guards and Decorators
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
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
    private readonly generateTermoEntregaUseCase: GenerateTermoEntregaUseCase,
    private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase,
    private readonly importDesarquivamentoUseCase: ImportDesarquivamentoUseCase,
    private readonly importRegistrosUseCase: ImportRegistrosUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova solicitação de desarquivamento' })
  @ApiResponse({
    status: 201,
    description: 'Desarquivamento criado com sucesso',
    type: Desarquivamento,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
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
      urgente: createDesarquivamentoDto.urgente || false,
      criadoPorId: currentUser.id,
    });

    this.logger.log(
      `Desarquivamento criado: ${result.id} por ${currentUser.usuario}`,
    );

    // Resposta dual: JSON para API, redirect para web
    if (req.headers.accept?.includes('application/json')) {
      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Desarquivamento criado com sucesso',
        data: result,
      });
    } else {
      return res.redirect(`/nugecid/${result.id}?created=true`);
    }
  }

  @Post('import-desarquivamentos')
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
  @ApiResponse({
    status: 200,
    description: 'Resultado da importação',
    type: ImportResultDto,
  })
  @ApiResponse({ status: 400, description: 'Arquivo inválido' })
  @Roles(RoleType.ADMIN, RoleType.GESTOR)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `file-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'text/csv',
        ];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Apenas arquivos Excel (.xlsx, .xls) ou .csv são permitidos',
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async importDesarquivamentos(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser: User,
    @Res() res: Response,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo é obrigatório');
    }

    const startTime = Date.now();
    const result = await this.importDesarquivamentoUseCase.execute(
      file.buffer,
      currentUser.id,
    );
    const processingTime = Date.now() - startTime;

    const enhancedResult = {
      ...result,
      processingTime,
      fileName: file.originalname,
      fileSize: file.size,
      importedAt: new Date(),
      importedBy: currentUser.usuario,
    };

    this.logger.log(
      `Importação de desarquivamentos concluída por ${currentUser.usuario}: ${result.successCount}/${result.totalRows} registros em ${processingTime}ms`,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: `Importação concluída: ${result.successCount} de ${result.totalRows} registros importados com sucesso.`,
      data: enhancedResult,
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
  @ApiResponse({ status: 201, description: 'Importação concluída' })
  @ApiResponse({
    status: 400,
    description: 'Arquivo inválido ou dados incorretos',
  })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
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

    try {
      const result = await this.importRegistrosUseCase.execute({
        file,
        userId: currentUser.id,
      });

      this.logger.log(
        `Importação de registros concluída: ${result.successCount}/${result.totalRows} registros importados por ${currentUser.usuario}`,
      );

      return {
        success: true,
        message: result.summary.message,
        data: {
          totalRows: result.totalRows,
          successCount: result.successCount,
          errorCount: result.errorCount,
          errors: result.errors,
          summary: result.summary,
        },
      };
    } catch (error) {
      this.logger.error('Erro durante importação de registros:', error);
      throw new BadRequestException(
        error.message || 'Erro ao processar arquivo de importação',
      );
    }
  }

  @Get(':id/termo')
  @ApiOperation({ summary: 'Gerar termo de entrega de desarquivamento em PDF' })
  @ApiParam({
    name: 'id',
    description: 'ID do desarquivamento',
    type: 'number',
  })
  @ApiResponse({ status: 200, description: 'PDF do termo gerado com sucesso' })
  @ApiResponse({ status: 404, description: 'Desarquivamento não encontrado' })
  @ApiResponse({ status: 500, description: 'Erro ao gerar o PDF' })
  @ApiBearerAuth()
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename=termo_de_entrega.pdf')
  async getTermoDeEntrega(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
    @CurrentUser() currentUser: User,
  ) {
    try {
      const result = await this.generateTermoEntregaUseCase.execute({
        id: +id,
        userId: currentUser.id,
        userRoles: [currentUser.role?.name || 'USER'],
      });

      this.logger.debug(
        `[PDF Generation] Termo gerado para desarquivamento ${id}`,
      );

      // Configurar headers para PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${result.fileName}"`,
      );
      res.setHeader('Content-Length', result.pdfBuffer.length);

      res.send(result.pdfBuffer);
    } catch (error) {
      this.logger.error(
        `Falha ao gerar PDF para o desarquivamento ${id}:`,
        error,
      );
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof ForbiddenException) {
        throw new ForbiddenException(error.message);
      }
      throw new InternalServerErrorException(
        'Ocorreu um erro ao gerar o termo em PDF.',
      );
    }
  }

  @Get()
  @Roles(RoleType.ADMIN, RoleType.GESTOR, RoleType.NUGECID_OPERATOR)
  @ApiOperation({ summary: 'Listar desarquivamentos com filtros e paginação' })
  @ApiResponse({
    status: 200,
    description: 'Lista de desarquivamentos',
    // type: PaginatedDesarquivamentos,
  })
  @ApiQuery({ type: QueryDesarquivamentoDto })
  @ApiBearerAuth()
  async findAll(
    @Query() queryDto: QueryDesarquivamentoDto,
    @CurrentUser() currentUser: User,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.findAllDesarquivamentosUseCase.execute({
      ...queryDto,
      userId: currentUser.id,
      userRoles: [currentUser.role?.name || 'USER'],
    });

    // Resposta dual: JSON para API, HTML para web
    if (req.headers.accept?.includes('application/json')) {
      return res.json({
        success: true,
        data: result,
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } else {
      // Renderizar página web (assumindo que existe um template)
      return res.render('nugecid/list', {
        title: 'Desarquivamentos - NUGECID',
        desarquivamentos: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        filters: queryDto,
        user: currentUser,
      });
    }
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Obter estatísticas do dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas do dashboard',
    // type: DashboardStats,
  })
  @Roles(RoleType.ADMIN, RoleType.GESTOR)
  @ApiBearerAuth()
  async getDashboard(
    @CurrentUser() currentUser: User,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const stats = await this.getDashboardStatsUseCase.execute({
      userId: currentUser.id,
      userRoles: [currentUser.role?.name || 'USER'],
    });

    return res.json({
      success: true,
      data: stats,
    });
  }

  @Get('export')
  @ApiOperation({ summary: 'Exportar desarquivamentos para Excel' })
  @ApiResponse({
    status: 200,
    description: 'Arquivo Excel gerado',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiQuery({ type: QueryDesarquivamentoDto })
  @Roles(RoleType.ADMIN, RoleType.GESTOR)
  @ApiBearerAuth()
  async exportToExcel(
    @Query() queryDto: QueryDesarquivamentoDto,
    @CurrentUser() currentUser: User,
    @Res() res: Response,
  ) {
    // Remove paginação para exportar todos os registros
    const result = await this.findAllDesarquivamentosUseCase.execute({
      ...queryDto,
      limit: 10000,
      page: 1,
      userId: currentUser.id,
      userRoles: [currentUser.role?.name || 'USER'],
    });

    // Cria planilha Excel
    const workbook = XLSX.utils.book_new();
    const worksheetData = result.data.map(item => ({
      ID: item.id,
      'Código de Barras': item.codigoBarras,
      Tipo: item.tipoSolicitacao,
      Status: item.status,
      'Nome Requerente': item.nomeSolicitante,
      'Nome Vítima': item.nomeVitima || '',
      'Número Registro': item.numeroRegistro,
      'Tipo Documento': item.tipoDocumento || '',
      'Data Fato': item.dataFato
        ? item.dataFato.toISOString().split('T')[0]
        : '',
      Finalidade: item.finalidade || '',
      Urgente: item.urgente ? 'Sim' : 'Não',
      'Localização Física': item.localizacaoFisica || '',
      'Prazo Atendimento': item.prazoAtendimento
        ? item.prazoAtendimento.toISOString()
        : '',
      'Data Atendimento': item.dataAtendimento
        ? item.dataAtendimento.toISOString()
        : '',
      Resultado: item.resultadoAtendimento || '',
      'Criado Por ID': item.criadoPorId || '',
      'Responsável ID': item.responsavelId || '',
      'Criado em': item.createdAt.toISOString(),
      Observações: item.observacoes || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Desarquivamentos');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const fileName = `desarquivamentos_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', buffer.length);

    this.logger.log(
      `Exportação realizada por ${currentUser.usuario}: ${result.total} registros`,
    );

    return res.send(buffer);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter desarquivamento por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID do desarquivamento',
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: 'Desarquivamento encontrado',
    type: Desarquivamento,
  })
  @ApiResponse({ status: 404, description: 'Desarquivamento não encontrado' })
  @ApiBearerAuth()
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const result = await this.findDesarquivamentoByIdUseCase.execute({
        id,
        userId: currentUser.id,
        userRoles: [currentUser.role?.name || 'USER'],
      });

      if (req.headers.accept?.includes('application/json')) {
        return res.json({
          success: true,
          data: result,
        });
      } else {
        return res.render('nugecid/detail', {
          title: `Desarquivamento ${result.codigoBarras}`,
          desarquivamento: result,
          user: currentUser,
        });
      }
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        if (req.headers.accept?.includes('application/json')) {
          return res.status(HttpStatus.NOT_FOUND).json({
            success: false,
            message: error.message,
          });
        } else {
          return res.redirect('/nugecid?error=not-found');
        }
      }

      if (error.message.includes('permissão')) {
        if (req.headers.accept?.includes('application/json')) {
          return res.status(HttpStatus.FORBIDDEN).json({
            success: false,
            message: error.message,
          });
        } else {
          return res.redirect('/nugecid?error=forbidden');
        }
      }

      throw error;
    }
  }

  @Get('barcode/:codigo')
  @ApiOperation({ summary: 'Obter desarquivamento por código de barras' })
  @ApiParam({
    name: 'codigo',
    description: 'Código de barras do desarquivamento',
  })
  @ApiResponse({
    status: 200,
    description: 'Desarquivamento encontrado',
    type: Desarquivamento,
  })
  @ApiResponse({ status: 404, description: 'Desarquivamento não encontrado' })
  @ApiBearerAuth()
  async findByBarcode(
    @Param('codigo') codigo: string,
    @CurrentUser() currentUser: User,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const result = await this.findAllDesarquivamentosUseCase.execute({
        filters: { codigoBarras: codigo },
        limit: 1,
        page: 1,
        userId: currentUser.id,
        userRoles: [currentUser.role?.name || 'USER'],
      });

      if (result.data.length === 0) {
        if (req.headers.accept?.includes('application/json')) {
          return res.status(HttpStatus.NOT_FOUND).json({
            success: false,
            message: 'Desarquivamento não encontrado',
          });
        } else {
          return res.redirect('/nugecid?error=not-found');
        }
      }

      const desarquivamento = result.data[0];

      if (req.headers.accept?.includes('application/json')) {
        return res.json({
          success: true,
          data: desarquivamento,
        });
      } else {
        return res.redirect(`/nugecid/${desarquivamento.id}`);
      }
    } catch (error) {
      if (req.headers.accept?.includes('application/json')) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Erro interno do servidor',
        });
      } else {
        return res.redirect('/nugecid?error=server-error');
      }
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar desarquivamento' })
  @ApiParam({
    name: 'id',
    description: 'ID do desarquivamento',
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: 'Desarquivamento atualizado com sucesso',
    type: Desarquivamento,
  })
  @ApiResponse({ status: 404, description: 'Desarquivamento não encontrado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para editar' })
  @ApiBearerAuth()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDesarquivamentoDto: UpdateDesarquivamentoDto,
    @CurrentUser() currentUser: User,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.updateDesarquivamentoUseCase.execute({
      id,
      ...updateDesarquivamentoDto,
      userId: currentUser.id,
      userRoles: [currentUser.role?.name || 'USER'],
    });

    this.logger.log(
      `Desarquivamento atualizado: ${result.id} por ${currentUser.usuario}`,
    );

    if (req.headers.accept?.includes('application/json')) {
      return res.json({
        success: true,
        message: 'Desarquivamento atualizado com sucesso',
        data: result,
      });
    } else {
      return res.redirect(`/nugecid/${result.id}?updated=true`);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover desarquivamento' })
  @ApiParam({
    name: 'id',
    description: 'ID do desarquivamento',
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: 'Desarquivamento removido com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Desarquivamento não encontrado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para remover' })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.deleteDesarquivamentoUseCase.execute({
      id,
      userId: currentUser.id,
      userRoles: [currentUser.role?.name || 'USER'],
      permanent: false, // Por padrão, usar soft delete
    });

    this.logger.log(
      `Desarquivamento removido: ${id} por ${currentUser.usuario}`,
    );

    if (req.headers.accept?.includes('application/json')) {
      return res.json({
        success: true,
        message: 'Desarquivamento removido com sucesso',
      });
    } else {
      return res.redirect('/nugecid?deleted=true');
    }
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restaurar desarquivamento excluído' })
  @ApiParam({
    name: 'id',
    description: 'ID do desarquivamento',
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: 'Desarquivamento restaurado com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Desarquivamento não encontrado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para restaurar' })
  @ApiResponse({
    status: 400,
    description: 'Desarquivamento não está excluído',
  })
  @Roles(RoleType.ADMIN, RoleType.NUGECID_OPERATOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async restore(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const result = await this.restoreDesarquivamentoUseCase.execute({
        id,
        userId: currentUser.id,
        userRoles: [currentUser.role?.name || 'USER'],
      });

      this.logger.log(
        `Desarquivamento restaurado: ${id} por ${currentUser.usuario}`,
      );

      if (req.headers.accept?.includes('application/json')) {
        return res.json({
          success: true,
          message: result.message,
        });
      } else {
        return res.redirect('/nugecid/excluidos?restored=true');
      }
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        if (req.headers.accept?.includes('application/json')) {
          return res.status(HttpStatus.NOT_FOUND).json({
            success: false,
            message: error.message,
          });
        } else {
          return res.redirect('/nugecid/excluidos?error=not-found');
        }
      }

      if (
        error.message.includes('permissão') ||
        error.message.includes('Acesso negado')
      ) {
        if (req.headers.accept?.includes('application/json')) {
          return res.status(HttpStatus.FORBIDDEN).json({
            success: false,
            message: error.message,
          });
        } else {
          return res.redirect('/nugecid/excluidos?error=forbidden');
        }
      }

      if (error.message.includes('não está excluído')) {
        if (req.headers.accept?.includes('application/json')) {
          return res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            message: error.message,
          });
        } else {
          return res.redirect('/nugecid/excluidos?error=not-deleted');
        }
      }

      throw error;
    }
  }
}
