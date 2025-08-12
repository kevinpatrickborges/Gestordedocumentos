"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NugecidService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NugecidService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const XLSX = require("xlsx");
const fs = require("fs");
const desarquivamento_entity_1 = require("./entities/desarquivamento.entity");
const tipo_solicitacao_vo_1 = require("./domain/value-objects/tipo-solicitacao.vo");
const PDFDocument = require("pdfkit");
const user_entity_1 = require("../users/entities/user.entity");
const auditoria_entity_1 = require("../audit/entities/auditoria.entity");
const import_result_dto_1 = require("./dto/import-result.dto");
const import_desarquivamento_dto_1 = require("./dto/import-desarquivamento.dto");
const import_registro_dto_1 = require("./dto/import-registro.dto");
const class_validator_1 = require("class-validator");
let NugecidService = NugecidService_1 = class NugecidService {
    constructor(desarquivamentoRepository, userRepository, auditoriaRepository) {
        this.desarquivamentoRepository = desarquivamentoRepository;
        this.userRepository = userRepository;
        this.auditoriaRepository = auditoriaRepository;
        this.logger = new common_1.Logger(NugecidService_1.name);
    }
    async create(createDesarquivamentoDto, currentUser) {
        const desarquivamento = this.desarquivamentoRepository.create({
            ...createDesarquivamentoDto,
            criadoPor: currentUser,
            status: desarquivamento_entity_1.StatusDesarquivamento.PENDENTE,
        });
        const saved = await this.desarquivamentoRepository.save(desarquivamento);
        if (Array.isArray(saved)) {
            throw new Error('A operação de salvar retornou um array, mas um único objeto era esperado.');
        }
        await this.saveAudit(currentUser.id, 'CREATE', 'DESARQUIVAMENTO', `Desarquivamento criado: ${saved.codigoBarras}`, { desarquivamentoId: saved.id });
        this.logger.log(`Desarquivamento criado: ${saved.codigoBarras} por ${currentUser.usuario}`);
        return this.findOne(saved.id);
    }
    async findAll(queryDto) {
        const { page = 1, limit = 10, search, status, tipo, usuarioId, dataInicio, dataFim, vencidos, sortBy = 'createdAt', sortOrder = 'DESC', } = queryDto;
        const queryBuilder = this.desarquivamentoRepository
            .createQueryBuilder('desarquivamento')
            .leftJoinAndSelect('desarquivamento.criadoPor', 'criadoPor')
            .leftJoinAndSelect('desarquivamento.responsavel', 'responsavel');
        if (search) {
            queryBuilder.andWhere('(desarquivamento.nomeSolicitante ILIKE :search OR ' +
                'desarquivamento.nomeVitima ILIKE :search OR ' +
                'desarquivamento.numeroRegistro ILIKE :search OR ' +
                'desarquivamento.codigoBarras ILIKE :search)', { search: `%${search}%` });
        }
        if (status && status.length > 0) {
            queryBuilder.andWhere('desarquivamento.status IN (:...status)', { status });
        }
        if (tipo && tipo.length > 0) {
            queryBuilder.andWhere('desarquivamento.tipo IN (:...tipo)', { tipo });
        }
        if (usuarioId) {
            queryBuilder.andWhere('desarquivamento.criadoPor.id = :usuarioId', { usuarioId });
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
            queryBuilder.andWhere('desarquivamento.prazoAtendimento < :now', {
                now: new Date(),
            });
        }
        const validSortFields = [
            'createdAt',
            'nomeSolicitante',
            'nomeVitima',
            'status',
            'tipo',
            'prazoAtendimento',
        ];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        queryBuilder.orderBy(`desarquivamento.${sortField}`, sortOrder);
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
    async findOne(id) {
        const desarquivamento = await this.desarquivamentoRepository
            .createQueryBuilder('desarquivamento')
            .leftJoinAndSelect('desarquivamento.criadoPor', 'criadoPor')
            .leftJoinAndSelect('desarquivamento.responsavel', 'responsavel')
            .where('desarquivamento.id = :id', { id })
            .getOne();
        if (!desarquivamento) {
            throw new common_1.NotFoundException('Desarquivamento não encontrado');
        }
        return desarquivamento;
    }
    async importFromXLSX(file, currentUser) {
        if (!file) {
            throw new common_1.BadRequestException('Arquivo não enviado.');
        }
        this.logger.log(`Iniciando importação do arquivo: ${file.originalname}`);
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        const result = new import_result_dto_1.ImportResultDto();
        result.totalRows = data.length;
        result.successCount = 0;
        result.errorCount = 0;
        result.errors = [];
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const rowNumber = i + 2;
            const importDto = new import_desarquivamento_dto_1.ImportDesarquivamentoDto();
            importDto.numero_processo = row['numero_processo'] || row['Numero Processo'] || row['Nº Processo'];
            importDto.requerente = row['requerente'] || row['Requerente'];
            importDto.data_requerimento = row['data_requerimento'] || row['Data Requerimento'];
            importDto.palavras_chave = row['palavras_chave'] || row['Palavras Chave'];
            importDto.assunto = row['assunto'] || row['Assunto'];
            importDto.autorId = currentUser.id;
            const errors = await (0, class_validator_1.validate)(importDto);
            if (errors.length > 0) {
                result.errorCount++;
                result.errors.push({
                    row: rowNumber,
                    details: {
                        message: errors
                            .map((err) => Object.values(err.constraints).join(', '))
                            .join('; '),
                        data: row,
                    }
                });
                continue;
            }
            try {
                const createDto = {
                    numeroRegistro: importDto.numero_processo,
                    nomeSolicitante: importDto.requerente,
                    tipoSolicitacao: tipo_solicitacao_vo_1.TipoSolicitacaoEnum.DESARQUIVAMENTO,
                };
                await this.create(createDto, currentUser);
                result.successCount++;
            }
            catch (error) {
                this.logger.error(`Erro ao salvar linha ${rowNumber}: ${error.message}`);
                result.errorCount++;
                result.errors.push({ row: rowNumber, details: { message: error.message, data: row } });
            }
        }
        this.logger.log(`Importação concluída para ${file.originalname}: ${result.successCount} sucessos, ${result.errorCount} falhas.`);
        return result;
    }
    async findByBarcode(codigoBarras) {
        const desarquivamento = await this.desarquivamentoRepository.findOne({
            where: { codigoBarras },
            relations: ['usuario', 'responsavel'],
        });
        if (!desarquivamento) {
            throw new common_1.NotFoundException('Desarquivamento não encontrado');
        }
        return desarquivamento;
    }
    async update(id, updateDesarquivamentoDto, currentUser) {
        const desarquivamento = await this.findOne(id);
        if (!desarquivamento.canBeEditedBy(currentUser)) {
            throw new common_1.ForbiddenException('Você não tem permissão para editar este desarquivamento');
        }
        Object.assign(desarquivamento, updateDesarquivamentoDto);
        if (updateDesarquivamentoDto.responsavelId) {
            const responsavel = await this.userRepository.findOne({
                where: { id: updateDesarquivamentoDto.responsavelId },
            });
            if (!responsavel) {
                throw new common_1.BadRequestException('Responsável não encontrado');
            }
            desarquivamento.responsavel = responsavel;
        }
        const updated = await this.desarquivamentoRepository.save(desarquivamento);
        await this.saveAudit(currentUser.id, 'UPDATE', 'DESARQUIVAMENTO', `Desarquivamento atualizado: ${updated.codigoBarras}`, { desarquivamentoId: updated.id, changes: updateDesarquivamentoDto });
        this.logger.log(`Desarquivamento atualizado: ${updated.codigoBarras} por ${currentUser.usuario}`);
        return this.findOne(updated.id);
    }
    async importRegistros(file, currentUser) {
        if (!file) {
            throw new common_1.BadRequestException('Arquivo não enviado.');
        }
        this.logger.log(`Iniciando importação de registros do arquivo: ${file.originalname}`);
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        const result = new import_result_dto_1.ImportResultDto();
        result.totalRows = data.length;
        result.successCount = 0;
        result.errorCount = 0;
        result.errors = [];
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const rowNumber = i + 2;
            const importDto = new import_registro_dto_1.ImportRegistroDto();
            importDto.desarquivamentoTipo = row['DESARQUIVAMENTO FÍSICO/DIGITAL'] || row['desarquivamento_tipo'];
            importDto.status = row['Status'] || row['status'];
            importDto.nomeCompleto = row['Nome Completo'] || row['nome_completo'];
            importDto.numDocumento = row['Nº DO NIC/LAUDO/AUTO/INFORMAÇÃO TÉCNICA'] || row['num_documento'];
            importDto.numProcesso = row['Nº do Processo'] || row['num_processo'];
            importDto.tipoDocumento = row['Tipo de Documento'] || row['tipo_documento'];
            importDto.dataSolicitacao = row['Data de solicitação'] || row['data_solicitacao'];
            importDto.dataDesarquivamento = row['Data do desarquivamento - SAG'] || row['data_desarquivamento'];
            importDto.dataDevolucao = row['Data da devolução pelo setor'] || row['data_devolucao'];
            importDto.setorDemandante = row['Setor Demandante'] || row['setor_demandante'];
            importDto.servidorResponsavel = row['Servidor Responsável'] || row['servidor_responsavel'];
            importDto.finalidade = row['Finalidade'] || row['finalidade'];
            const prorrogacaoValue = row['Prorrogação'] || row['prorrogacao'];
            if (prorrogacaoValue !== undefined) {
                importDto.prorrogacao = prorrogacaoValue === 'Sim' || prorrogacaoValue === 'sim' || prorrogacaoValue === true || prorrogacaoValue === 'true';
            }
            const errors = await (0, class_validator_1.validate)(importDto);
            if (errors.length > 0) {
                result.errorCount++;
                result.errors.push({
                    row: rowNumber,
                    details: {
                        message: errors
                            .map((err) => Object.values(err.constraints).join(', '))
                            .join('; '),
                        data: row,
                    }
                });
                continue;
            }
            try {
                const createDto = {
                    tipoSolicitacao: tipo_solicitacao_vo_1.TipoSolicitacaoEnum.DESARQUIVAMENTO,
                    nomeSolicitante: importDto.nomeCompleto,
                    nomeVitima: importDto.nomeCompleto,
                    numeroRegistro: importDto.numDocumento,
                    tipoDocumento: importDto.tipoDocumento,
                    dataFato: importDto.dataSolicitacao ? new Date(importDto.dataSolicitacao) : undefined,
                    observacoes: `Finalidade: ${importDto.finalidade || 'N/A'} | Setor: ${importDto.setorDemandante || 'N/A'} | Servidor: ${importDto.servidorResponsavel || 'N/A'}`,
                };
                await this.create(createDto, currentUser);
                result.successCount++;
            }
            catch (error) {
                this.logger.error(`Erro ao salvar linha ${rowNumber} do arquivo ${file.originalname}: ${error.message}`);
                result.errorCount++;
                result.errors.push({ row: rowNumber, details: { message: error.message, data: row } });
            }
        }
        this.logger.log(`Importação de registros concluída para ${file.originalname}: ${result.successCount} sucessos, ${result.errorCount} falhas.`);
        await this.saveAudit(currentUser.id, 'IMPORT', 'REGISTRO', `Importação de registros: ${result.successCount}/${result.totalRows} sucesso(s).`, { fileName: file.originalname, result });
        return result;
    }
    async remove(id, currentUser) {
        const desarquivamento = await this.findOne(id);
        if (!desarquivamento.canBeDeletedBy(currentUser)) {
            throw new common_1.ForbiddenException('Você não tem permissão para remover este desarquivamento');
        }
        await this.desarquivamentoRepository.softDelete(id);
        await this.saveAudit(currentUser.id, 'DELETE', 'DESARQUIVAMENTO', `Desarquivamento removido: ${desarquivamento.codigoBarras}`, { desarquivamentoId: desarquivamento.id });
        this.logger.log(`Desarquivamento removido: ${desarquivamento.codigoBarras} por ${currentUser.usuario}`);
    }
    async importFromExcel(filePath, currentUser) {
        try {
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);
            const result = new import_result_dto_1.ImportResultDto();
            result.totalRows = data.length;
            result.successCount = 0;
            result.errorCount = 0;
            result.errors = [];
            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                const rowNumber = i + 2;
                try {
                    await this.createFromExcelRow(row, currentUser);
                    result.successCount++;
                }
                catch (error) {
                    result.errorCount++;
                    result.errors.push({
                        row: rowNumber,
                        details: { message: error.message, data: row },
                    });
                }
            }
            fs.unlinkSync(filePath);
            await this.saveAudit(currentUser.id, 'IMPORT', 'DESARQUIVAMENTO', `Importação de planilha: ${result.successCount}/${result.totalRows} registros`, { result });
            this.logger.log(`Importação concluída: ${result.successCount}/${result.totalRows} registros por ${currentUser.usuario}`);
            return result;
        }
        catch (error) {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            throw new common_1.BadRequestException(`Erro na importação: ${error.message}`);
        }
    }
    async getDashboardStats() {
        const total = await this.desarquivamentoRepository.count();
        const pendentes = await this.desarquivamentoRepository.count({
            where: { status: desarquivamento_entity_1.StatusDesarquivamento.PENDENTE },
        });
        const emAndamento = await this.desarquivamentoRepository.count({
            where: { status: desarquivamento_entity_1.StatusDesarquivamento.EM_ANDAMENTO },
        });
        const concluidos = await this.desarquivamentoRepository.count({
            where: { status: desarquivamento_entity_1.StatusDesarquivamento.CONCLUIDO },
        });
        const vencidos = await this.desarquivamentoRepository
            .createQueryBuilder('desarquivamento')
            .where('desarquivamento.prazoAtendimento < :now', { now: new Date() })
            .andWhere('desarquivamento.status != :concluido', {
            concluido: desarquivamento_entity_1.StatusDesarquivamento.CONCLUIDO,
        })
            .getCount();
        const porStatus = await this.desarquivamentoRepository
            .createQueryBuilder('desarquivamento')
            .select('desarquivamento.status', 'status')
            .addSelect('COUNT(desarquivamento.id)', 'count')
            .groupBy('desarquivamento.status')
            .getRawMany();
        const porTipo = await this.desarquivamentoRepository
            .createQueryBuilder('desarquivamento')
            .select('desarquivamento.tipoSolicitacao', 'tipo')
            .addSelect('COUNT(desarquivamento.id)', 'count')
            .groupBy('desarquivamento.tipoSolicitacao')
            .getRawMany();
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
    async createFromExcelRow(row, currentUser) {
        const data = {
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
        if (!data.nomeSolicitante) {
            throw new Error('Nome do requerente é obrigatório');
        }
        if (!data.numeroRegistro) {
            throw new Error('Número do registro é obrigatório');
        }
        return this.create(data, currentUser);
    }
    mapTipoFromExcel(tipo) {
        if (!tipo)
            return tipo_solicitacao_vo_1.TipoSolicitacaoEnum.DESARQUIVAMENTO;
        const tipoLower = tipo.toLowerCase().trim();
        if (tipoLower.includes('desarquiv'))
            return tipo_solicitacao_vo_1.TipoSolicitacaoEnum.DESARQUIVAMENTO;
        if (tipoLower.includes('cópia') || tipoLower.includes('copia'))
            return tipo_solicitacao_vo_1.TipoSolicitacaoEnum.COPIA;
        if (tipoLower.includes('vista'))
            return tipo_solicitacao_vo_1.TipoSolicitacaoEnum.VISTA;
        if (tipoLower.includes('certidão') || tipoLower.includes('certidao'))
            return tipo_solicitacao_vo_1.TipoSolicitacaoEnum.CERTIDAO;
        return tipo_solicitacao_vo_1.TipoSolicitacaoEnum.DESARQUIVAMENTO;
    }
    parseBooleanFromExcel(value) {
        if (typeof value === 'boolean')
            return value;
        if (typeof value === 'string') {
            const lower = value.toLowerCase().trim();
            return lower === 'sim' || lower === 'true' || lower === '1' || lower === 'x';
        }
        if (typeof value === 'number')
            return value === 1;
        return false;
    }
    getStatusColor(status) {
        const colors = {
            [desarquivamento_entity_1.StatusDesarquivamento.PENDENTE]: '#fbbf24',
            [desarquivamento_entity_1.StatusDesarquivamento.EM_ANDAMENTO]: '#3b82f6',
            [desarquivamento_entity_1.StatusDesarquivamento.CONCLUIDO]: '#10b981',
            [desarquivamento_entity_1.StatusDesarquivamento.CANCELADO]: '#ef4444',
        };
        return colors[status] || '#6b7280';
    }
    async generatePdf(desarquivamento) {
        try {
            this.logger.log(`Iniciando geração de PDF para o desarquivamento ID: ${desarquivamento.id}`);
            this.logger.debug('Dados do desarquivamento para o PDF:', JSON.stringify(desarquivamento, null, 2));
            return new Promise((resolve, reject) => {
                const doc = new PDFDocument({
                    size: 'A4',
                    margins: { top: 50, bottom: 50, left: 72, right: 72 },
                    bufferPages: true,
                });
                doc.font('Helvetica').fontSize(12).text('GOVERNO DO ESTADO DO RIO GRANDE DO NORTE', { align: 'center' });
                doc.text('SECRETARIA DE ESTADO DA SEGURANÇA PÚBLICA E DA DEFESA SOCIAL', { align: 'center' });
                doc.text('INSTITUTO TÉCNICO-CIENTÍFICO DE PERÍCIA - ITEP/RN', { align: 'center' });
                doc.moveDown(2);
                doc.font('Helvetica-Bold').fontSize(16).text('TERMO DE DESARQUIVAMENTO', { align: 'center' });
                doc.moveDown(2);
                const dataSolicitacao = new Date(desarquivamento.createdAt).toLocaleDateString('pt-BR');
                const texto = `Pelo presente termo, certifico que, para fins de ${desarquivamento.finalidade || 'não especificado'}, foi desarquivado o procedimento referente a(o) ${desarquivamento.tipoDocumento || 'documento'} de número ${desarquivamento.numeroRegistro}, que tem como parte(s) ${desarquivamento.nomeSolicitante} e ${desarquivamento.nomeVitima || 'não aplicável'}. A solicitação foi realizada em ${dataSolicitacao}.`;
                doc.font('Helvetica').fontSize(12).text(texto, { align: 'justify' });
                doc.moveDown(2);
                doc.font('Helvetica-Bold').fontSize(12).text('DETALHES DA SOLICITAÇÃO');
                doc.moveDown();
                doc.font('Helvetica').fontSize(12);
                doc.text(`- Código de Barras: ${desarquivamento.codigoBarras}`);
                doc.text(`- Solicitante: ${desarquivamento.criadoPor.nome}`);
                doc.text(`- Data da Solicitação: ${new Date(desarquivamento.createdAt).toLocaleString('pt-BR')}`);
                doc.text(`- Prazo para Atendimento: ${new Date(desarquivamento.prazoAtendimento).toLocaleDateString('pt-BR')}`);
                doc.moveDown(3);
                doc.font('Helvetica').fontSize(12).text('___________________________________________', { align: 'center' });
                doc.text(desarquivamento.responsavel ? desarquivamento.responsavel.nome : 'Responsável não atribuído', { align: 'center' });
                doc.text('Responsável pelo Desarquivamento', { align: 'center' });
                doc.moveDown(2);
                const dataGeracao = new Date().toLocaleString('pt-BR');
                doc.font('Helvetica').fontSize(10).text(`Gerado em: ${dataGeracao} - SGC/ITEP`, { align: 'center' });
                const buffers = [];
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfData = Buffer.concat(buffers);
                    resolve(pdfData);
                });
                doc.on('error', (err) => {
                    this.logger.error('Erro no stream do PDF:', err);
                    reject(err);
                });
                doc.end();
            });
        }
        catch (error) {
            this.logger.error(`Erro catastrófico ao gerar PDF para ID ${desarquivamento?.id}:`, error.stack);
            throw error;
        }
    }
    async saveAudit(userId, action, resource, details, data) {
        try {
            const auditData = auditoria_entity_1.Auditoria.createResourceAudit(userId, action, resource, 0, { details, data }, 'unknown', 'unknown');
            const audit = this.auditoriaRepository.create(auditData);
            await this.auditoriaRepository.save(audit);
        }
        catch (error) {
            this.logger.error(`Erro ao salvar auditoria: ${error.message}`);
        }
    }
};
exports.NugecidService = NugecidService;
exports.NugecidService = NugecidService = NugecidService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(desarquivamento_entity_1.Desarquivamento)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(auditoria_entity_1.Auditoria)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], NugecidService);
//# sourceMappingURL=nugecid.service.js.map