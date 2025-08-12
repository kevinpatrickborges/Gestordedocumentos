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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDesarquivamentoUseCase = void 0;
const common_1 = require("@nestjs/common");
const domain_1 = require("../../../domain");
const nugecid_constants_1 = require("../../../domain/nugecid.constants");
let CreateDesarquivamentoUseCase = class CreateDesarquivamentoUseCase {
    constructor(desarquivamentoRepository) {
        this.desarquivamentoRepository = desarquivamentoRepository;
    }
    async execute(request) {
        await this.validateRequest(request);
        const codigoBarras = await this.generateUniqueCodigoBarras();
        const codigoBarrasVO = domain_1.CodigoBarras.create(codigoBarras);
        const numeroRegistroVO = domain_1.NumeroRegistro.create(request.numeroRegistro);
        const tipoSolicitacaoVO = domain_1.TipoSolicitacao.create(request.tipoSolicitacao);
        const statusVO = domain_1.StatusDesarquivamento.createPendente();
        const desarquivamento = domain_1.DesarquivamentoDomain.create({
            codigoBarras: codigoBarrasVO,
            tipoSolicitacao: tipoSolicitacaoVO,
            status: statusVO,
            nomeSolicitante: request.nomeSolicitante,
            nomeVitima: request.nomeVitima,
            numeroRegistro: numeroRegistroVO,
            tipoDocumento: request.tipoDocumento,
            dataFato: request.dataFato,
            prazoAtendimento: request.prazoAtendimento,
            finalidade: request.finalidade,
            observacoes: request.observacoes,
            urgente: request.urgente,
            localizacaoFisica: request.localizacaoFisica,
            criadoPorId: request.criadoPorId,
            responsavelId: request.responsavelId,
        });
        const savedDesarquivamento = await this.desarquivamentoRepository.create(desarquivamento);
        return this.mapToResponse(savedDesarquivamento);
    }
    async validateRequest(request) {
        const existingByNumero = await this.desarquivamentoRepository.findByNumeroRegistro(request.numeroRegistro);
        if (existingByNumero.length > 0) {
            throw new Error(`Já existe um desarquivamento com o número de registro: ${request.numeroRegistro}`);
        }
        if (!Object.values(['DESARQUIVAMENTO', 'COPIA', 'VISTA', 'CERTIDAO']).includes(request.tipoSolicitacao)) {
            throw new Error('Tipo de solicitação inválido');
        }
        if (!request.criadoPorId || request.criadoPorId <= 0) {
            throw new Error('ID do usuário criador é obrigatório');
        }
        if (request.responsavelId && request.responsavelId <= 0) {
            throw new Error('ID do responsável deve ser válido');
        }
        if (!request.nomeSolicitante || request.nomeSolicitante.trim().length === 0) {
            throw new Error('Nome do solicitante é obrigatório');
        }
        if (!request.numeroRegistro || request.numeroRegistro.trim().length === 0) {
            throw new Error('Número do registro é obrigatório');
        }
        if (request.nomeSolicitante.length > 255) {
            throw new Error('Nome do solicitante deve ter no máximo 255 caracteres');
        }
        if (request.nomeVitima && request.nomeVitima.length > 255) {
            throw new Error('Nome da vítima deve ter no máximo 255 caracteres');
        }
        if (request.tipoDocumento && request.tipoDocumento.length > 100) {
            throw new Error('Tipo do documento deve ter no máximo 100 caracteres');
        }
        if (request.localizacaoFisica && request.localizacaoFisica.length > 255) {
            throw new Error('Localização física deve ter no máximo 255 caracteres');
        }
        if (request.dataFato && request.dataFato > new Date()) {
            throw new Error('Data do fato não pode ser futura');
        }
        if (request.prazoAtendimento && request.prazoAtendimento <= new Date()) {
            throw new Error('Prazo de atendimento deve ser futuro');
        }
    }
    async generateUniqueCodigoBarras() {
        let attempts = 0;
        const maxAttempts = 10;
        while (attempts < maxAttempts) {
            const codigoBarras = domain_1.CodigoBarras.generateNew();
            const exists = await this.desarquivamentoRepository.existsByCodigoBarras(codigoBarras.value);
            if (!exists) {
                return codigoBarras.value;
            }
            attempts++;
        }
        throw new Error('Não foi possível gerar um código de barras único após várias tentativas');
    }
    mapToResponse(desarquivamento) {
        const plainObject = desarquivamento.toPlainObject();
        return {
            id: plainObject.id,
            codigoBarras: plainObject.codigoBarras,
            tipoSolicitacao: plainObject.tipoSolicitacao,
            status: plainObject.status,
            nomeSolicitante: plainObject.nomeSolicitante,
            nomeVitima: plainObject.nomeVitima,
            numeroRegistro: plainObject.numeroRegistro,
            tipoDocumento: plainObject.tipoDocumento,
            dataFato: plainObject.dataFato,
            prazoAtendimento: plainObject.prazoAtendimento,
            dataAtendimento: plainObject.dataAtendimento,
            resultadoAtendimento: plainObject.resultadoAtendimento,
            finalidade: plainObject.finalidade,
            observacoes: plainObject.observacoes,
            urgente: plainObject.urgente,
            localizacaoFisica: plainObject.localizacaoFisica,
            criadoPorId: plainObject.criadoPorId,
            responsavelId: plainObject.responsavelId,
            createdAt: plainObject.createdAt,
            updatedAt: plainObject.updatedAt,
        };
    }
};
exports.CreateDesarquivamentoUseCase = CreateDesarquivamentoUseCase;
exports.CreateDesarquivamentoUseCase = CreateDesarquivamentoUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(nugecid_constants_1.DESARQUIVAMENTO_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object])
], CreateDesarquivamentoUseCase);
//# sourceMappingURL=create-desarquivamento.use-case.js.map