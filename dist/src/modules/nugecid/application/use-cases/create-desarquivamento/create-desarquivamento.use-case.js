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
        const statusVO = domain_1.StatusDesarquivamento.createSolicitado();
        const desarquivamento = domain_1.DesarquivamentoDomain.create({
            tipoDesarquivamento: request.tipoDesarquivamento,
            status: statusVO,
            nomeCompleto: request.nomeCompleto,
            numeroNicLaudoAuto: request.numeroNicLaudoAuto,
            numeroProcesso: request.numeroProcesso,
            tipoDocumento: request.tipoDocumento,
            dataSolicitacao: new Date(request.dataSolicitacao),
            dataDesarquivamentoSAG: request.dataDesarquivamentoSAG ? new Date(request.dataDesarquivamentoSAG) : undefined,
            dataDevolucaoSetor: request.dataDevolucaoSetor ? new Date(request.dataDevolucaoSetor) : undefined,
            setorDemandante: request.setorDemandante,
            servidorResponsavel: request.servidorResponsavel,
            finalidadeDesarquivamento: request.finalidadeDesarquivamento,
            solicitacaoProrrogacao: request.solicitacaoProrrogacao,
            urgente: request.urgente,
            criadoPorId: request.criadoPorId,
            responsavelId: request.responsavelId,
        });
        const savedDesarquivamento = await this.desarquivamentoRepository.create(desarquivamento);
        return this.mapToResponse(savedDesarquivamento);
    }
    async validateRequest(request) {
        if (!request.nomeCompleto ||
            request.nomeCompleto.trim().length === 0) {
            throw new Error('Nome completo é obrigatório');
        }
        if (!request.numeroNicLaudoAuto || request.numeroNicLaudoAuto.trim().length === 0) {
            throw new Error('Número NIC/Laudo/Auto é obrigatório');
        }
        if (!request.numeroProcesso || request.numeroProcesso.trim().length === 0) {
            throw new Error('Número do processo é obrigatório');
        }
        if (!request.criadoPorId || request.criadoPorId <= 0) {
            throw new Error('ID do usuário criador é obrigatório e deve ser válido');
        }
        const existingByNumero = await this.desarquivamentoRepository.findByNumeroRegistro(request.numeroProcesso);
        if (existingByNumero.length > 0) {
            throw new Error(`Já existe um desarquivamento com o número de processo: ${request.numeroProcesso}`);
        }
        const tiposValidos = ['FISICO', 'DIGITAL', 'NAO_LOCALIZADO'];
        if (!tiposValidos.includes(request.tipoDesarquivamento)) {
            throw new Error(`Tipo de desarquivamento inválido. Valores aceitos: ${tiposValidos.join(', ')}`);
        }
        if (request.responsavelId && request.responsavelId <= 0) {
            throw new Error('ID do responsável deve ser válido');
        }
        if (request.nomeCompleto.length > 255) {
            throw new Error('Nome completo deve ter no máximo 255 caracteres');
        }
        if (request.numeroProcesso.length > 50) {
            throw new Error('Número do processo deve ter no máximo 50 caracteres');
        }
        if (request.setorDemandante && request.setorDemandante.length > 255) {
            throw new Error('Setor demandante deve ter no máximo 255 caracteres');
        }
        if (request.tipoDocumento && request.tipoDocumento.length > 100) {
            throw new Error('Tipo do documento deve ter no máximo 100 caracteres');
        }
        if (request.servidorResponsavel && request.servidorResponsavel.length > 255) {
            throw new Error('Servidor responsável deve ter no máximo 255 caracteres');
        }
        if (request.finalidadeDesarquivamento && request.finalidadeDesarquivamento.length > 500) {
            throw new Error('Finalidade deve ter no máximo 500 caracteres');
        }
        if (request.dataSolicitacao) {
            const dataSolicitacao = new Date(request.dataSolicitacao);
            if (dataSolicitacao > new Date()) {
                throw new Error('Data de solicitação não pode ser futura');
            }
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
        return {
            id: desarquivamento.id?.value || 0,
            codigoBarras: desarquivamento.numeroNicLaudoAuto,
            tipoSolicitacao: desarquivamento.tipoDesarquivamento,
            status: desarquivamento.status.value,
            nomeSolicitante: desarquivamento.nomeCompleto,
            nomeVitima: undefined,
            numeroRegistro: desarquivamento.numeroProcesso,
            numeroProcesso: desarquivamento.numeroProcesso,
            tipoDocumento: desarquivamento.tipoDocumento,
            dataFato: undefined,
            prazoAtendimento: undefined,
            dataAtendimento: desarquivamento.dataDesarquivamentoSAG,
            resultadoAtendimento: undefined,
            finalidade: desarquivamento.finalidadeDesarquivamento,
            observacoes: undefined,
            urgente: desarquivamento.urgente || false,
            localizacaoFisica: undefined,
            criadoPorId: desarquivamento.criadoPorId,
            responsavelId: desarquivamento.responsavelId,
            createdAt: desarquivamento.createdAt,
            updatedAt: desarquivamento.updatedAt,
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