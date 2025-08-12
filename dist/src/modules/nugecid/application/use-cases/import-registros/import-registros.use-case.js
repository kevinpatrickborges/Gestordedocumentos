"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ImportRegistrosUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportRegistrosUseCase = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const XLSX = require("xlsx");
const import_registro_dto_1 = require("../../../dto/import-registro.dto");
let ImportRegistrosUseCase = ImportRegistrosUseCase_1 = class ImportRegistrosUseCase {
    constructor() {
        this.logger = new common_1.Logger(ImportRegistrosUseCase_1.name);
    }
    async execute(request) {
        this.logger.log(`Iniciando importação de registros pelo usuário ${request.userId}`);
        await this.validateFile(request.file);
        const workbook = XLSX.read(request.file.buffer, { type: 'buffer', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        const totalRows = data.length;
        let successCount = 0;
        const errors = [];
        this.logger.log(`Processando ${totalRows} linhas da planilha`);
        for (let i = 0; i < totalRows; i++) {
            const row = data[i];
            const rowNumber = i + 2;
            try {
                const registroDto = await this.mapRowToDto(row);
                const validationErrors = await (0, class_validator_1.validate)(registroDto);
                if (validationErrors.length > 0) {
                    errors.push({
                        row: rowNumber,
                        data: row,
                        errors: validationErrors.map(err => ({
                            property: err.property,
                            constraints: err.constraints || {}
                        }))
                    });
                }
                else {
                    await this.saveRegistro(registroDto, request.userId);
                    successCount++;
                }
            }
            catch (error) {
                this.logger.error(`Erro ao processar linha ${rowNumber}:`, error);
                errors.push({
                    row: rowNumber,
                    data: row,
                    errors: [{
                            property: 'processing',
                            constraints: { error: error.message || 'Erro desconhecido ao processar linha' }
                        }]
                });
            }
        }
        const response = {
            totalRows,
            successCount,
            errorCount: errors.length,
            errors,
            summary: {
                message: this.generateSummaryMessage(totalRows, successCount, errors.length),
                details: this.generateSummaryDetails(totalRows, successCount, errors.length)
            }
        };
        this.logger.log(`Importação concluída: ${successCount}/${totalRows} registros importados com sucesso`);
        return response;
    }
    async validateFile(file) {
        if (!file) {
            throw new Error('Arquivo não fornecido');
        }
        const allowedMimeTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new Error('Formato de arquivo não suportado. Use .xlsx, .xls ou .csv');
        }
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error('Arquivo muito grande. Tamanho máximo permitido: 10MB');
        }
    }
    async mapRowToDto(row) {
        const dto = new import_registro_dto_1.ImportRegistroDto();
        dto.desarquivamentoTipo = this.mapTipoDesarquivamento(row['DESARQUIVAMENTO FÍSICO/DIGITAL'] || row['desarquivamentoTipo']);
        dto.status = this.mapStatusDesarquivamento(row['Status'] || row['status']);
        dto.nomeCompleto = this.sanitizeString(row['Nome Completo'] || row['nomeCompleto']);
        dto.numDocumento = this.sanitizeString(row['Nº DO NIC/LAUDO/AUTO/INFORMAÇÃO TÉCNICA'] || row['numDocumento']);
        dto.dataSolicitacao = this.formatDate(row['Data de solicitação'] || row['dataSolicitacao']);
        dto.numProcesso = this.sanitizeString(row['Nº do Processo'] || row['numProcesso']);
        dto.tipoDocumento = this.sanitizeString(row['Tipo do Documento'] || row['tipoDocumento']);
        dto.dataDesarquivamento = this.formatDate(row['Data do desarquivamento - SAG'] || row['dataDesarquivamento']);
        dto.dataDevolucao = this.formatDate(row['Data da devolução pelo setor'] || row['dataDevolucao']);
        dto.setorDemandante = this.sanitizeString(row['Setor Demandante'] || row['setorDemandante']);
        dto.servidorResponsavel = this.sanitizeString(row['Servidor Responsável'] || row['servidorResponsavel']);
        dto.finalidade = this.sanitizeString(row['Finalidade'] || row['finalidade']);
        dto.prorrogacao = this.mapBoolean(row['Prorrogação'] || row['prorrogacao']);
        return dto;
    }
    mapTipoDesarquivamento(value) {
        if (!value)
            return null;
        const normalizedValue = String(value).trim();
        switch (normalizedValue.toLowerCase()) {
            case 'físico':
            case 'fisico':
                return import_registro_dto_1.TipoDesarquivamento.FISICO;
            case 'digital':
                return import_registro_dto_1.TipoDesarquivamento.DIGITAL;
            case 'não localizado':
            case 'nao localizado':
                return import_registro_dto_1.TipoDesarquivamento.NAO_LOCALIZADO;
            default:
                throw new Error(`Tipo de desarquivamento inválido: ${normalizedValue}`);
        }
    }
    mapStatusDesarquivamento(value) {
        if (!value)
            return null;
        const normalizedValue = String(value).trim();
        switch (normalizedValue.toLowerCase()) {
            case 'finalizado':
                return import_registro_dto_1.StatusDesarquivamento.FINALIZADO;
            case 'desarquivado':
                return import_registro_dto_1.StatusDesarquivamento.DESARQUIVADO;
            case 'não coletado':
            case 'nao coletado':
                return import_registro_dto_1.StatusDesarquivamento.NAO_COLETADO;
            case 'solicitado':
                return import_registro_dto_1.StatusDesarquivamento.SOLICITADO;
            case 'rearquivamento solicitado':
                return import_registro_dto_1.StatusDesarquivamento.REARQUIVAMENTO_SOLICITADO;
            case 'retirado pelo setor':
                return import_registro_dto_1.StatusDesarquivamento.RETIRADO_PELO_SETOR;
            case 'não localizado':
            case 'nao localizado':
                return import_registro_dto_1.StatusDesarquivamento.NAO_LOCALIZADO;
            default:
                throw new Error(`Status de desarquivamento inválido: ${normalizedValue}`);
        }
    }
    sanitizeString(value) {
        if (!value)
            return undefined;
        return String(value).trim();
    }
    formatDate(value) {
        if (!value)
            return undefined;
        try {
            let date;
            if (value instanceof Date) {
                date = value;
            }
            else if (typeof value === 'string') {
                date = new Date(value);
            }
            else if (typeof value === 'number') {
                date = new Date((value - 25569) * 86400 * 1000);
            }
            else {
                throw new Error('Formato de data não reconhecido');
            }
            if (isNaN(date.getTime())) {
                throw new Error('Data inválida');
            }
            return date.toISOString().split('T')[0];
        }
        catch (error) {
            throw new Error(`Erro ao formatar data: ${error.message}`);
        }
    }
    mapBoolean(value) {
        if (value === undefined || value === null)
            return false;
        if (typeof value === 'boolean')
            return value;
        const normalizedValue = String(value).toLowerCase().trim();
        return ['sim', 'yes', 'true', '1', 'verdadeiro'].includes(normalizedValue);
    }
    async saveRegistro(dto, userId) {
        this.logger.debug(`Salvando registro: ${dto.nomeCompleto} - ${dto.numDocumento}`);
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    generateSummaryMessage(total, success, errors) {
        if (errors === 0) {
            return `Importação concluída com sucesso! Todos os ${total} registros foram importados.`;
        }
        else if (success === 0) {
            return `Falha na importação! Nenhum registro foi importado devido a erros.`;
        }
        else {
            return `Importação parcialmente concluída. ${success} de ${total} registros foram importados com sucesso.`;
        }
    }
    generateSummaryDetails(total, success, errors) {
        const details = [];
        details.push(`Total de linhas processadas: ${total}`);
        details.push(`Registros importados com sucesso: ${success}`);
        if (errors > 0) {
            details.push(`Registros com erro: ${errors}`);
            details.push('Verifique os detalhes dos erros abaixo para corrigir os dados e tentar novamente.');
        }
        return details.join('\n');
    }
};
exports.ImportRegistrosUseCase = ImportRegistrosUseCase;
exports.ImportRegistrosUseCase = ImportRegistrosUseCase = ImportRegistrosUseCase_1 = __decorate([
    (0, common_1.Injectable)()
], ImportRegistrosUseCase);
//# sourceMappingURL=import-registros.use-case.js.map