import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UseInterceptors, UploadedFile, ParseIntPipe, HttpStatus, HttpCode, Res, Req, Logger, BadRequestException, Header, NotFoundException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
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

// New Services
import { NugecidImportService } from './nugecid-import.service';
import { NugecidStatsService } from './nugecid-stats.service';
import { NugecidPdfService } from './nugecid-pdf.service';
import { NugecidExportService } from './nugecid-export.service';

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
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova solicitação de desarquivamento' })
  @ApiResponse({ status: 201, description: 'Desarquivamento criado com sucesso' })
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
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  async importDesarquivamentos(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser: User,
    @Res() res: Response,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo é obrigatório');
    }

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

  @Post('import-registros')
  @ApiOperation({ summary: 'Importar registros de um arquivo .xlsx ou .csv' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Arquivo (.xlsx ou .csv) contendo os registros para importação',
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
  @ApiParam({ name: 'id', description: 'ID do desarquivamento', type: 'number' })
  @ApiBearerAuth()
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename=termo_de_entrega.pdf')
  async getTermoDeEntrega(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
    @CurrentUser() currentUser: User,
  ) {
    const desarquivamento = await this.findDesarquivamentoByIdUseCase.execute({ id, userId: currentUser.id, userRoles: [currentUser.role?.name || 'USER'] });
    const buffer = await this.nugecidPdfService.generatePdf(desarquivamento as any);

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
    const result = await this.findAllDesarquivamentosUseCase.execute({
      ...queryDto,
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
  @ApiParam({ name: 'id', description: 'ID do desarquivamento', type: 'integer' })
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
  @ApiParam({ name: 'codigo', description: 'Código de barras do desarquivamento' })
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
  @ApiParam({ name: 'id', description: 'ID do desarquivamento', type: 'integer' })
  @ApiBearerAuth()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDesarquivamentoDto: UpdateDesarquivamentoDto,
    @CurrentUser() currentUser: User,
  ) {
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
  }

  @Delete(':id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Remover desarquivamento' })
  @ApiParam({ name: 'id', description: 'ID do desarquivamento', type: 'integer' })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
  ) {
    await this.deleteDesarquivamentoUseCase.execute({
      id,
      userId: currentUser.id,
      userRoles: [currentUser.role?.name || 'USER'],
      permanent: false,
    });

    return {
      success: true,
      message: 'Desarquivamento removido com sucesso',
    };
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restaurar desarquivamento excluído' })
  @ApiParam({ name: 'id', description: 'ID do desarquivamento', type: 'integer' })
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async restore(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
  ) {
    const result = await this.restoreDesarquivamentoUseCase.execute({
      id,
      userId: currentUser.id,
      userRoles: [currentUser.role?.name || 'USER'],
    });

    return {
      success: true,
      message: result.message,
    };
  }
}