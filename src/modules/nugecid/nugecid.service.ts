import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In, FindManyOptions } from 'typeorm';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

import {
  Desarquivamento,
  StatusDesarquivamento,
} from './entities/desarquivamento.entity';
import { TipoSolicitacaoEnum } from './domain/value-objects/tipo-solicitacao.vo';
import * as PDFDocument from 'pdfkit';
import { User } from '../users/entities/user.entity';
import { Auditoria } from '../audit/entities/auditoria.entity';
import { CreateDesarquivamentoDto } from './dto/create-desarquivamento.dto';
import { UpdateDesarquivamentoDto } from './dto/update-desarquivamento.dto';
import { QueryDesarquivamentoDto } from './dto/query-desarquivamento.dto';
import { ImportResultDto } from './dto/import-result.dto';
import { ImportDesarquivamentoDto } from './dto/import-desarquivamento.dto';
import { ImportRegistroDto } from './dto/import-registro.dto';
import { validate } from 'class-validator';

export interface PaginatedDesarquivamentos {
  desarquivamentos: Desarquivamento[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  total: number;
  pendentes: number;
  emAndamento: number;
  concluidos: number;
  vencidos: number;
  porStatus: { status: string; count: number; color: string }[];
  porTipo: { tipo: string; count: number }[];
  recentes: Desarquivamento[];
}

@Injectable()
export class NugecidService {
  private readonly logger = new Logger(NugecidService.name);

  constructor(
    @InjectRepository(Desarquivamento)
    private readonly desarquivamentoRepository: Repository<Desarquivamento>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Auditoria)
    private readonly auditoriaRepository: Repository<Auditoria>,
  ) {}

  /**
   * Cria novo desarquivamento
   */
  async create(
    createDesarquivamentoDto: CreateDesarquivamentoDto,
    currentUser: User,
  ): Promise<Desarquivamento> {
    const desarquivamento = this.desarquivamentoRepository.create({
      ...createDesarquivamentoDto,
      criadoPor: currentUser,
      status: StatusDesarquivamento.PENDENTE,
    });

    const saved = await this.desarquivamentoRepository.save(desarquivamento);

    if (Array.isArray(saved)) {
      throw new Error(
        'A operação de salvar retornou um array, mas um único objeto era esperado.',
      );
    }

    // Salva auditoria
    await this.saveAudit(
      currentUser.id,
      'CREATE',
      'DESARQUIVAMENTO',
      `Desarquivamento criado: ${saved.codigoBarras}`,
      { desarquivamentoId: saved.id },
    );

    this.logger.log(
      `Desarquivamento criado: ${saved.codigoBarras} por ${currentUser.usuario}`,
    );

    return this.findOne(saved.id);
  }

  /**
   * Lista desarquivamentos com paginação e filtros
   */
  async findAll(
    queryDto: QueryDesarquivamentoDto,
  ): Promise<PaginatedDesarquivamentos> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      tipo,
      usuarioId,
      dataInicio,
      dataFim,
      vencidos,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto;

    const queryBuilder = this.desarquivamentoRepository
      .createQueryBuilder('desarquivamento')
      .leftJoinAndSelect('desarquivamento.criadoPor', 'criadoPor')
      .leftJoinAndSelect('desarquivamento.responsavel', 'responsavel');

    // Filtros
    if (search) {
      queryBuilder.andWhere(
        '(desarquivamento.nomeSolicitante ILIKE :search OR ' +
          'desarquivamento.nomeVitima ILIKE :search OR ' +
          'desarquivamento.numeroRegistro ILIKE :search OR ' +
          'desarquivamento.codigoBarras ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status && status.length > 0) {
      queryBuilder.andWhere('desarquivamento.status IN (:...status)', {
        status,
      });
    }

    if (tipo && tipo.length > 0) {
      queryBuilder.andWhere('desarquivamento.tipo IN (:...tipo)', { tipo });
    }

    if (usuarioId) {
      queryBuilder.andWhere('desarquivamento.criadoPor.id = :usuarioId', {
        usuarioId,
      });
    }

    if (dataInicio) {
      queryBuilder.andWhere('desarquivamento.createdAt >= :dataInicio', {
        dataInicio: new Date(dataInicio),
      });
    }

    if (dataFim) {
      queryBuilder.andWhere('desarquivamento.createdAt <= :dataFim', {
        dataFim: new Date(dataFim),
      });
    }

    if (vencidos) {
      queryBuilder.andWhere('desarquivamento.prazo_atendimento < :now', {
        now: new Date(),
      });
    }

    // Ordenação
    const validSortFields = [
      'createdAt',
      'nomeSolicitante',
      'nomeVitima',
      'status',
      'tipo',
      'prazoAtendimento',
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(
      `desarquivamento.${sortField}`,
      sortOrder as 'ASC' | 'DESC',
    );

    // Paginação
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [desarquivamentos, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      desarquivamentos,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Busca desarquivamento por ID
   */
  async findOne(id: number): Promise<Desarquivamento> {
    const desarquivamento = await this.desarquivamentoRepository
      .createQueryBuilder('desarquivamento')
      .leftJoinAndSelect('desarquivamento.criadoPor', 'criadoPor')
      .leftJoinAndSelect('desarquivamento.responsavel', 'responsavel')
      .where('desarquivamento.id = :id', { id })
      .getOne();

    if (!desarquivamento) {
      throw new NotFoundException('Desarquivamento não encontrado');
    }

    return desarquivamento;
  }

  /**
   * Importa desarquivamentos de um arquivo XLSX.
   */
  async importFromXLSX(
    file: Express.Multer.File,
    currentUser: User,
  ): Promise<ImportResultDto> {
    if (!file) {
      throw new BadRequestException('Arquivo não enviado.');
    }

    this.logger.log(`Iniciando importação do arquivo: ${file.originalname}`);

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const result = new ImportResultDto();
    result.totalRows = data.length;
    result.successCount = 0;
    result.errorCount = 0;
    result.errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // +2 porque a linha 1 é o cabeçalho e o índice é base 0

      const importDto = new ImportDesarquivamentoDto();
      // Mapeamento explícito para garantir a integridade dos tipos
      importDto.numero_processo =
        row['numero_processo'] || row['Numero Processo'] || row['Nº Processo'];
      importDto.requerente = row['requerente'] || row['Requerente'];
      importDto.data_requerimento =
        row['data_requerimento'] || row['Data Requerimento'];
      importDto.palavras_chave = row['palavras_chave'] || row['Palavras Chave'];
      importDto.assunto = row['assunto'] || row['Assunto'];
      importDto.autorId = currentUser.id;

      const errors = await validate(importDto);

      if (errors.length > 0) {
        result.errorCount++;
        result.errors.push({
          row: rowNumber,
          details: {
            message: errors
              .map(err => Object.values(err.constraints).join(', '))
              .join('; '),
            data: row,
          },
        });
        continue; // Pula para a próxima linha
      }

      try {
        const createDto: CreateDesarquivamentoDto = {
          numeroRegistro: importDto.numero_processo,
          nomeSolicitante: importDto.requerente,
          tipoSolicitacao: TipoSolicitacaoEnum.DESARQUIVAMENTO, // Adicionado tipo padrão
        };

        await this.create(createDto, currentUser);
        result.successCount++;
      } catch (error) {
        this.logger.error(
          `Erro ao salvar linha ${rowNumber}: ${error.message}`,
        );
        result.errorCount++;
        result.errors.push({
          row: rowNumber,
          details: { message: error.message, data: row },
        });
      }
    }

    this.logger.log(
      `Importação concluída para ${file.originalname}: ${result.successCount} sucessos, ${result.errorCount} falhas.`,
    );

    return result;
  }

  /**
   * Busca desarquivamento por código de barras
   */
  async findByBarcode(codigoBarras: string): Promise<Desarquivamento> {
    const desarquivamento = await this.desarquivamentoRepository.findOne({
      where: { codigoBarras },
      relations: ['usuario', 'responsavel'],
    });

    if (!desarquivamento) {
      throw new NotFoundException('Desarquivamento não encontrado');
    }

    return desarquivamento;
  }

  /**
   * Atualiza desarquivamento
   */
  async update(
    id: number,
    updateDesarquivamentoDto: UpdateDesarquivamentoDto,
    currentUser: User,
  ): Promise<Desarquivamento> {
    const desarquivamento = await this.findOne(id);

    // Verifica permissões
    if (!desarquivamento.canBeEditedBy(currentUser)) {
      throw new ForbiddenException(
        'Você não tem permissão para editar este desarquivamento',
      );
    }

    // Atualiza os campos
    Object.assign(desarquivamento, updateDesarquivamentoDto);

    // Se mudou o responsável, atualiza
    if (updateDesarquivamentoDto.responsavelId) {
      const responsavel = await this.userRepository.findOne({
        where: { id: updateDesarquivamentoDto.responsavelId },
      });
      if (!responsavel) {
        throw new BadRequestException('Responsável não encontrado');
      }
      desarquivamento.responsavel = responsavel;
    }

    const updated = await this.desarquivamentoRepository.save(desarquivamento);

    // Salva auditoria
    await this.saveAudit(
      currentUser.id,
      'UPDATE',
      'DESARQUIVAMENTO',
      `Desarquivamento atualizado: ${updated.codigoBarras}`,
      { desarquivamentoId: updated.id, changes: updateDesarquivamentoDto },
    );

    this.logger.log(
      `Desarquivamento atualizado: ${updated.codigoBarras} por ${currentUser.usuario}`,
    );

    return this.findOne(updated.id);
  }

  /**
   * Importa registros de um arquivo XLSX ou CSV.
   */
  async importRegistros(
    file: Express.Multer.File,
    currentUser: User,
  ): Promise<ImportResultDto> {
    if (!file) {
      throw new BadRequestException('Arquivo não enviado.');
    }

    this.logger.log(
      `Iniciando importação de registros do arquivo: ${file.originalname}`,
    );

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const result = new ImportResultDto();
    result.totalRows = data.length;
    result.successCount = 0;
    result.errorCount = 0;
    result.errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // +2 porque a linha 1 é o cabeçalho e o índice é base 0

      const importDto = new ImportRegistroDto();
      // Mapeamento baseado na especificação do PRD
      importDto.desarquivamentoTipo =
        row['DESARQUIVAMENTO FÍSICO/DIGITAL'] || row['desarquivamento_tipo'];
      importDto.status = row['Status'] || row['status'];
      importDto.nomeCompleto = row['Nome Completo'] || row['nome_completo'];
      importDto.numDocumento =
        row['Nº DO NIC/LAUDO/AUTO/INFORMAÇÃO TÉCNICA'] || row['num_documento'];
      importDto.numProcesso = row['Nº do Processo'] || row['num_processo'];
      importDto.tipoDocumento =
        row['Tipo de Documento'] || row['tipo_documento'];
      importDto.dataSolicitacao =
        row['Data de solicitação'] || row['data_solicitacao'];
      importDto.dataDesarquivamento =
        row['Data do desarquivamento - SAG'] || row['data_desarquivamento'];
      importDto.dataDevolucao =
        row['Data da devolução pelo setor'] || row['data_devolucao'];
      importDto.setorDemandante =
        row['Setor Demandante'] || row['setor_demandante'];
      importDto.servidorResponsavel =
        row['Servidor Responsável'] || row['servidor_responsavel'];
      importDto.finalidade = row['Finalidade'] || row['finalidade'];

      // Converte prorrogação para boolean
      const prorrogacaoValue = row['Prorrogação'] || row['prorrogacao'];
      if (prorrogacaoValue !== undefined) {
        importDto.prorrogacao =
          prorrogacaoValue === 'Sim' ||
          prorrogacaoValue === 'sim' ||
          prorrogacaoValue === true ||
          prorrogacaoValue === 'true';
      }

      const errors = await validate(importDto);

      if (errors.length > 0) {
        result.errorCount++;
        result.errors.push({
          row: rowNumber,
          details: {
            message: errors
              .map(err => Object.values(err.constraints).join(', '))
              .join('; '),
            data: row,
          },
        });
        continue; // Pula para a próxima linha
      }

      try {
        // Adaptação para o DTO de criação existente
        const createDto: CreateDesarquivamentoDto = {
          tipoSolicitacao: TipoSolicitacaoEnum.DESARQUIVAMENTO,
          nomeSolicitante: importDto.nomeCompleto,
          nomeVitima: importDto.nomeCompleto, // Usando o mesmo nome
          numeroRegistro: importDto.numDocumento,
          tipoDocumento: importDto.tipoDocumento,
          dataFato: importDto.dataSolicitacao
            ? new Date(importDto.dataSolicitacao)
            : undefined,
          observacoes: `Finalidade: ${importDto.finalidade || 'N/A'} | Setor: ${importDto.setorDemandante || 'N/A'} | Servidor: ${importDto.servidorResponsavel || 'N/A'}`,
        };

        await this.create(createDto, currentUser);
        result.successCount++;
      } catch (error) {
        this.logger.error(
          `Erro ao salvar linha ${rowNumber} do arquivo ${file.originalname}: ${error.message}`,
        );
        result.errorCount++;
        result.errors.push({
          row: rowNumber,
          details: { message: error.message, data: row },
        });
      }
    }

    this.logger.log(
      `Importação de registros concluída para ${file.originalname}: ${result.successCount} sucessos, ${result.errorCount} falhas.`,
    );

    // Salva auditoria
    await this.saveAudit(
      currentUser.id,
      'IMPORT',
      'REGISTRO',
      `Importação de registros: ${result.successCount}/${result.totalRows} sucesso(s).`,
      { fileName: file.originalname, result },
    );

    return result;
  }

  /**
   * Remove desarquivamento (soft delete)
   */
  async remove(id: number, currentUser: User): Promise<void> {
    const desarquivamento = await this.findOne(id);

    // Verifica permissões
    if (!desarquivamento.canBeDeletedBy(currentUser)) {
      throw new ForbiddenException(
        'Você não tem permissão para remover este desarquivamento',
      );
    }

    await this.desarquivamentoRepository.softDelete(id);

    // Salva auditoria
    await this.saveAudit(
      currentUser.id,
      'DELETE',
      'DESARQUIVAMENTO',
      `Desarquivamento removido: ${desarquivamento.codigoBarras}`,
      { desarquivamentoId: desarquivamento.id },
    );

    this.logger.log(
      `Desarquivamento removido: ${desarquivamento.codigoBarras} por ${currentUser.usuario}`,
    );
  }

  /**
   * Importa desarquivamentos de planilha Excel
   */
  async importFromExcel(
    filePath: string,
    currentUser: User,
  ): Promise<ImportResultDto> {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const result = new ImportResultDto();
      result.totalRows = data.length;
      result.successCount = 0;
      result.errorCount = 0;
      result.errors = [];
      // Metadados serão definidos no controller

      for (let i = 0; i < data.length; i++) {
        const row = data[i] as any;
        const rowNumber = i + 2; // +2 porque começa na linha 2 (header na linha 1)

        try {
          await this.createFromExcelRow(row, currentUser);
          result.successCount++;
        } catch (error) {
          result.errorCount++;
          result.errors.push({
            row: rowNumber,
            details: { message: error.message, data: row },
          });
        }
      }

      // Remove arquivo temporário
      fs.unlinkSync(filePath);

      // Salva auditoria
      await this.saveAudit(
        currentUser.id,
        'IMPORT',
        'DESARQUIVAMENTO',
        `Importação de planilha: ${result.successCount}/${result.totalRows} registros`,
        { result },
      );

      this.logger.log(
        `Importação concluída: ${result.successCount}/${result.totalRows} registros por ${currentUser.usuario}`,
      );

      return result;
    } catch (error) {
      // Remove arquivo em caso de erro
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw new BadRequestException(`Erro na importação: ${error.message}`);
    }
  }

  /**
   * Obtém estatísticas para o dashboard
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const total = await this.desarquivamentoRepository.count();

    const pendentes = await this.desarquivamentoRepository.count({
      where: { status: StatusDesarquivamento.PENDENTE },
    });

    const emAndamento = await this.desarquivamentoRepository.count({
      where: { status: StatusDesarquivamento.EM_ANDAMENTO },
    });

    const concluidos = await this.desarquivamentoRepository.count({
      where: { status: StatusDesarquivamento.CONCLUIDO },
    });

    const vencidos = await this.desarquivamentoRepository
      .createQueryBuilder('desarquivamento')
      .where('desarquivamento.prazo_atendimento < :now', { now: new Date() })
      .andWhere('desarquivamento.status != :concluido', {
        concluido: StatusDesarquivamento.CONCLUIDO,
      })
      .getCount();

    // Estatísticas por status
    const porStatus = await this.desarquivamentoRepository
      .createQueryBuilder('desarquivamento')
      .select('desarquivamento.status', 'status')
      .addSelect('COUNT(desarquivamento.id)', 'count')
      .groupBy('desarquivamento.status')
      .getRawMany();

    // Estatísticas por tipo
    const porTipo = await this.desarquivamentoRepository
      .createQueryBuilder('desarquivamento')
      .select('desarquivamento.tipoSolicitacao', 'tipo')
      .addSelect('COUNT(desarquivamento.id)', 'count')
      .groupBy('desarquivamento.tipoSolicitacao')
      .getRawMany();

    // Registros recentes
    const recentes = await this.desarquivamentoRepository.find({
      relations: ['usuario'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return {
      total,
      pendentes,
      emAndamento,
      concluidos,
      vencidos,
      porStatus: porStatus.map(item => ({
        status: item.status,
        count: parseInt(item.count),
        color: this.getStatusColor(item.status),
      })),
      porTipo: porTipo.map(item => ({
        tipo: item.tipo,
        count: parseInt(item.count),
      })),
      recentes,
    };
  }

  /**
   * Cria desarquivamento a partir de linha do Excel
   */
  private async createFromExcelRow(
    row: any,
    currentUser: User,
  ): Promise<Desarquivamento> {
    // Mapeia campos da planilha
    const data: CreateDesarquivamentoDto = {
      tipoSolicitacao: this.mapTipoFromExcel(row['Tipo'] || row['tipo']),
      nomeSolicitante: row['Nome Requerente'] || row['nome_requerente'] || '',
      nomeVitima: row['Nome Vítima'] || row['nome_vitima'] || '',
      numeroRegistro: row['Número Registro'] || row['numero_registro'] || '',
      tipoDocumento: row['Tipo Documento'] || row['tipo_documento'] || '',
      dataFato: row['Data Fato'] ? new Date(row['Data Fato']) : null,
      finalidade: row['Finalidade'] || row['finalidade'] || '',
      observacoes: row['Observações'] || row['observacoes'] || '',
      urgente: this.parseBooleanFromExcel(row['Urgente'] || row['urgente']),
      localizacaoFisica: row['Localização'] || row['localizacao_fisica'] || '',
    };

    // Validações básicas
    if (!data.nomeSolicitante) {
      throw new Error('Nome do requerente é obrigatório');
    }

    if (!data.numeroRegistro) {
      throw new Error('Número do registro é obrigatório');
    }

    return this.create(data, currentUser);
  }

  /**
   * Mapeia tipo da planilha para enum
   */
  private mapTipoFromExcel(tipo: string): TipoSolicitacaoEnum {
    if (!tipo) return TipoSolicitacaoEnum.DESARQUIVAMENTO;

    const tipoLower = tipo.toLowerCase().trim();

    if (tipoLower.includes('desarquiv'))
      return TipoSolicitacaoEnum.DESARQUIVAMENTO;
    if (tipoLower.includes('cópia') || tipoLower.includes('copia'))
      return TipoSolicitacaoEnum.COPIA;
    if (tipoLower.includes('vista')) return TipoSolicitacaoEnum.VISTA;
    if (tipoLower.includes('certidão') || tipoLower.includes('certidao'))
      return TipoSolicitacaoEnum.CERTIDAO;

    return TipoSolicitacaoEnum.DESARQUIVAMENTO;
  }

  /**
   * Converte valor da planilha para boolean
   */
  private parseBooleanFromExcel(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lower = value.toLowerCase().trim();
      return (
        lower === 'sim' || lower === 'true' || lower === '1' || lower === 'x'
      );
    }
    if (typeof value === 'number') return value === 1;
    return false;
  }

  /**
   * Obtém cor do status
   */
  private getStatusColor(status: string): string {
    const colors = {
      [StatusDesarquivamento.PENDENTE]: '#fbbf24',
      [StatusDesarquivamento.EM_ANDAMENTO]: '#3b82f6',
      [StatusDesarquivamento.CONCLUIDO]: '#10b981',
      [StatusDesarquivamento.CANCELADO]: '#ef4444',
    };
    return colors[status] || '#6b7280';
  }

  /**
   * Gera o Termo de Desarquivamento em PDF
   */
  async generatePdf(desarquivamento: Desarquivamento): Promise<Buffer> {
    try {
      this.logger.log(
        `Iniciando geração de PDF para o desarquivamento ID: ${desarquivamento.id}`,
      );
      this.logger.debug(
        'Dados do desarquivamento para o PDF:',
        JSON.stringify(desarquivamento, null, 2),
      );

      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 72, right: 72 },
          bufferPages: true,
        });

        // Cabeçalho
        doc
          .font('Helvetica')
          .fontSize(12)
          .text('GOVERNO DO ESTADO DO RIO GRANDE DO NORTE', {
            align: 'center',
          });
        doc.text(
          'SECRETARIA DE ESTADO DA SEGURANÇA PÚBLICA E DA DEFESA SOCIAL',
          { align: 'center' },
        );
        doc.text('INSTITUTO TÉCNICO-CIENTÍFICO DE PERÍCIA - ITEP/RN', {
          align: 'center',
        });
        doc.moveDown(2);

        // Título
        doc
          .font('Helvetica-Bold')
          .fontSize(16)
          .text('TERMO DE DESARQUIVAMENTO', { align: 'center' });
        doc.moveDown(2);

        // Corpo do Termo
        const dataSolicitacao = new Date(
          desarquivamento.createdAt,
        ).toLocaleDateString('pt-BR');
        const texto = `Pelo presente termo, certifico que, para fins de ${desarquivamento.finalidade || 'não especificado'}, foi desarquivado o procedimento referente a(o) ${desarquivamento.tipoDocumento || 'documento'} de número ${desarquivamento.numeroRegistro}, que tem como parte(s) ${desarquivamento.nomeSolicitante} e ${desarquivamento.nomeVitima || 'não aplicável'}. A solicitação foi realizada em ${dataSolicitacao}.`;
        doc.font('Helvetica').fontSize(12).text(texto, { align: 'justify' });
        doc.moveDown(2);

        // Detalhes do Registro
        doc.font('Helvetica-Bold').fontSize(12).text('DETALHES DA SOLICITAÇÃO');
        doc.moveDown();
        doc.font('Helvetica').fontSize(12);
        doc.text(`- Código de Barras: ${desarquivamento.codigoBarras}`);
        doc.text(`- Solicitante: ${desarquivamento.criadoPor.nome}`);
        doc.text(
          `- Data da Solicitação: ${new Date(desarquivamento.createdAt).toLocaleString('pt-BR')}`,
        );
        doc.text(
          `- Prazo para Atendimento: ${new Date(desarquivamento.prazoAtendimento).toLocaleDateString('pt-BR')}`,
        );
        doc.moveDown(3);

        // Assinatura
        doc
          .font('Helvetica')
          .fontSize(12)
          .text('___________________________________________', {
            align: 'center',
          });
        doc.text(
          desarquivamento.responsavel
            ? desarquivamento.responsavel.nome
            : 'Responsável não atribuído',
          { align: 'center' },
        );
        doc.text('Responsável pelo Desarquivamento', { align: 'center' });
        doc.moveDown(2);

        // Rodapé
        const dataGeracao = new Date().toLocaleString('pt-BR');
        doc
          .font('Helvetica')
          .fontSize(10)
          .text(`Gerado em: ${dataGeracao} - SGC/ITEP`, { align: 'center' });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });
        doc.on('error', err => {
          this.logger.error('Erro no stream do PDF:', err);
          reject(err);
        });
        doc.end();
      });
    } catch (error) {
      this.logger.error(
        `Erro catastrófico ao gerar PDF para ID ${desarquivamento?.id}:`,
        error.stack,
      );
      // Lançar o erro para que o NestJS o capture e envie uma resposta de erro HTTP adequada
      throw error;
    }
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
