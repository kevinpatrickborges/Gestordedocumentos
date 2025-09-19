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
  Request,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { NotificacoesService, NotificacoesSchedulerService, CreateNotificacaoDto, QueryNotificacoesDto } from '../services';
import { Notificacao, TipoNotificacao, PrioridadeNotificacao } from '../entities';

@ApiTags('notificacoes')
@Controller('notificacoes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificacoesController {
  constructor(
    private readonly notificacoesService: NotificacoesService,
    private readonly notificacoesSchedulerService: NotificacoesSchedulerService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova notificação' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Notificação criada com sucesso',
    type: Notificacao,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário ou solicitação não encontrados',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de acesso inválido',
  })
  async create(
    @Body() createNotificacaoDto: CreateNotificacaoDto,
    @Request() req: any,
  ): Promise<Notificacao> {
    // Por padrão, criar notificação para o usuário logado
    const notificacaoData = {
      ...createNotificacaoDto,
      usuarioId: createNotificacaoDto.usuarioId || req.user.id,
    };
    return this.notificacoesService.create(notificacaoData);
  }

  @Get()
  @ApiOperation({ summary: 'Listar notificações do usuário logado' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número da página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Itens por página' })
  @ApiQuery({ name: 'lida', required: false, type: Boolean, description: 'Filtrar por status de leitura' })
  @ApiQuery({ name: 'tipo', required: false, enum: TipoNotificacao, description: 'Filtrar por tipo' })
  @ApiQuery({ name: 'prioridade', required: false, enum: PrioridadeNotificacao, description: 'Filtrar por prioridade' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de notificações retornada com sucesso',
    type: [Notificacao],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de acesso inválido',
  })
  async findAll(
    @Query() queryDto: QueryNotificacoesDto,
    @Request() req: any,
  ): Promise<{
    data: Notificacao[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.notificacoesService.findByUsuario(req.user.id, queryDto);
  }

  @Get('estatisticas')
  @ApiOperation({ summary: 'Obter estatísticas de notificações do usuário' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estatísticas retornadas com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de acesso inválido',
  })
  async getEstatisticas(@Request() req: any) {
    return this.notificacoesService.getEstatisticas(req.user.id);
  }

  @Get('nao-lidas')
  @ApiOperation({ summary: 'Listar apenas notificações não lidas' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notificações não lidas retornadas com sucesso',
    type: [Notificacao],
  })
  async getNaoLidas(@Request() req: any): Promise<{
    data: Notificacao[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.notificacoesService.findByUsuario(req.user.id, { lida: false });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma notificação específica' })
  @ApiParam({ name: 'id', description: 'ID da notificação', type: 'number' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notificação encontrada com sucesso',
    type: Notificacao,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Notificação não encontrada',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de acesso inválido',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<Notificacao> {
    return this.notificacoesService.findOne(id, req.user.id);
  }

  @Patch(':id/marcar-lida')
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  @ApiParam({ name: 'id', description: 'ID da notificação', type: 'number' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notificação marcada como lida com sucesso',
    type: Notificacao,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Notificação não encontrada',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de acesso inválido',
  })
  async marcarComoLida(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<Notificacao> {
    return this.notificacoesService.marcarComoLida(id, req.user.id);
  }

  @Patch(':id/marcar-nao-lida')
  @ApiOperation({ summary: 'Marcar notificação como não lida' })
  @ApiParam({ name: 'id', description: 'ID da notificação', type: 'number' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notificação marcada como não lida com sucesso',
    type: Notificacao,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Notificação não encontrada',
  })
  async marcarComoNaoLida(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<Notificacao> {
    return this.notificacoesService.marcarComoNaoLida(id, req.user.id);
  }

  @Patch('marcar-todas-lidas')
  @ApiOperation({ summary: 'Marcar todas as notificações como lidas' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Todas as notificações foram marcadas como lidas',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de acesso inválido',
  })
  async marcarTodasComoLidas(@Request() req: any): Promise<{ affected: number }> {
    const affected = await this.notificacoesService.marcarTodasComoLidas(req.user.id);
    return { affected };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir notificação' })
  @ApiParam({ name: 'id', description: 'ID da notificação', type: 'number' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Notificação excluída com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Notificação não encontrada',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de acesso inválido',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<void> {
    return this.notificacoesService.delete(id, req.user.id);
  }

  // Endpoints específicos para tipos de notificação
  @Post('solicitacao-pendente')
  @ApiOperation({ summary: 'Criar notificação de solicitação pendente' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Notificação de solicitação pendente criada com sucesso',
    type: Notificacao,
  })
  async criarSolicitacaoPendente(
    @Body() body: { solicitacaoId: number; diasPendentes: number; usuarioId?: number },
    @Request() req: any,
  ): Promise<Notificacao> {
    const usuarioId = body.usuarioId || req.user.id;
    return this.notificacoesService.criarNotificacaoSolicitacaoPendente(
      usuarioId,
      body.solicitacaoId,
      body.diasPendentes,
    );
  }

  @Post('novo-processo')
  @ApiOperation({ summary: 'Criar notificação de novo processo SEIRN' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Notificação de novo processo criada com sucesso',
    type: Notificacao,
  })
  async criarNovoProcesso(
    @Body() body: { processoId: number; numeroProcesso: string; usuarioId?: number },
    @Request() req: any,
  ): Promise<Notificacao> {
    const usuarioId = body.usuarioId || req.user.id;
    return this.notificacoesService.criarNotificacaoNovoProcesso(
      usuarioId,
      body.processoId,
      body.numeroProcesso,
    );
  }

  @Post('verificar-pendentes')
  @ApiOperation({ summary: 'Verificar e criar notificações para solicitações pendentes' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Verificação concluída e notificações criadas',
  })
  async verificarSolicitacoesPendentes(): Promise<{ notificacoesCriadas: number }> {
    return this.notificacoesSchedulerService.forcarVerificacao();
  }
}