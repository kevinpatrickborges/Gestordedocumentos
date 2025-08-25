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
exports.GenerateTermoEntregaUseCase = void 0;
const common_1 = require("@nestjs/common");
const domain_1 = require("../../../domain");
const nugecid_constants_1 = require("../../../domain/nugecid.constants");
let GenerateTermoEntregaUseCase = class GenerateTermoEntregaUseCase {
    constructor(desarquivamentoRepository) {
        this.desarquivamentoRepository = desarquivamentoRepository;
    }
    async execute(request) {
        this.validateRequest(request);
        const desarquivamentoId = domain_1.DesarquivamentoId.create(request.id);
        const desarquivamento = await this.desarquivamentoRepository.findById(desarquivamentoId);
        if (!desarquivamento) {
            throw new Error(`Desarquivamento com ID ${request.id} não encontrado`);
        }
        if (!desarquivamento.canBeAccessedBy(request.userId, request.userRoles)) {
            throw new Error('Acesso negado: você não tem permissão para gerar termo deste desarquivamento');
        }
        this.validateDesarquivamentoForTermo(desarquivamento);
        const termoData = await this.prepareTermoData(desarquivamento, request);
        const pdfBuffer = await this.generatePDF(termoData, request.templateOptions);
        const fileName = this.generateFileName(desarquivamento);
        return {
            pdfBuffer,
            fileName,
            contentType: 'application/pdf',
            generatedAt: new Date(),
        };
    }
    validateRequest(request) {
        if (!request.id || request.id <= 0 || !Number.isInteger(request.id)) {
            throw new Error('ID deve ser um número inteiro positivo');
        }
        if (!request.userId || request.userId <= 0) {
            throw new Error('ID do usuário é obrigatório');
        }
        if (!request.userRoles || !Array.isArray(request.userRoles)) {
            throw new Error('Roles do usuário são obrigatórias');
        }
        if (request.templateOptions?.assinatura) {
            const { nome, cargo } = request.templateOptions.assinatura;
            if (!nome || nome.trim().length === 0) {
                throw new Error('Nome do responsável pela assinatura é obrigatório');
            }
            if (!cargo || cargo.trim().length === 0) {
                throw new Error('Cargo do responsável pela assinatura é obrigatório');
            }
        }
    }
    validateDesarquivamentoForTermo(desarquivamento) {
        if (desarquivamento.status.isPending()) {
            throw new Error('Não é possível gerar termo para desarquivamento pendente');
        }
        if (desarquivamento.status.isCancelled()) {
            throw new Error('Não é possível gerar termo para desarquivamento cancelado');
        }
        if (desarquivamento.isDeleted()) {
            throw new Error('Não é possível gerar termo para desarquivamento excluído');
        }
        if (!desarquivamento.localizacaoFisica) {
            throw new Error('Localização física é obrigatória para gerar termo de entrega');
        }
    }
    async prepareTermoData(desarquivamento, request) {
        const plainObject = desarquivamento.toPlainObject();
        const instituicao = {
            nome: 'Instituto Técnico-Científico de Perícia - ITEP',
            endereco: 'Rua Exemplo, 123 - Centro - Natal/RN',
            telefone: '(84) 3232-3232',
            email: 'contato@itep.rn.gov.br',
            logo: request.templateOptions?.logoPath,
        };
        const responsavel = {
            nome: request.templateOptions?.assinatura?.nome || 'Responsável NUGECID',
            cargo: request.templateOptions?.assinatura?.cargo || 'Servidor Público',
        };
        return {
            desarquivamento: {
                id: plainObject.id,
                codigoBarras: plainObject.codigoBarras,
                numeroRegistro: plainObject.numeroRegistro,
                tipoSolicitacao: plainObject.tipoSolicitacao,
                nomeSolicitante: plainObject.nomeSolicitante,
                nomeVitima: plainObject.nomeVitima,
                dataFato: plainObject.dataFato,
                finalidade: plainObject.finalidade,
                observacoes: request.templateOptions?.incluirObservacoes
                    ? plainObject.observacoes
                    : undefined,
                localizacaoFisica: request.templateOptions?.incluirLocalizacao
                    ? plainObject.localizacaoFisica
                    : undefined,
                urgente: plainObject.urgente,
            },
            entrega: {
                dataEntrega: request.templateOptions?.assinatura?.data || new Date(),
                responsavel,
                recebedor: {
                    nome: plainObject.nomeSolicitante,
                    documento: '',
                    assinatura: '',
                },
            },
            instituicao,
        };
    }
    async generatePDF(termoData, templateOptions) {
        const htmlContent = this.generateHTMLTemplate(termoData, templateOptions);
        const mockPdfContent = `
      TERMO DE ENTREGA DE DOCUMENTO
      
      Código de Barras: ${termoData.desarquivamento.codigoBarras}
      Número do Registro: ${termoData.desarquivamento.numeroRegistro}
      Tipo: ${termoData.desarquivamento.tipoSolicitacao}
      Solicitante: ${termoData.desarquivamento.nomeSolicitante}
      Data de Entrega: ${termoData.entrega.dataEntrega.toLocaleDateString('pt-BR')}
      
      Responsável: ${termoData.entrega.responsavel.nome}
      Cargo: ${termoData.entrega.responsavel.cargo}
      
      Instituição: ${termoData.instituicao.nome}
      ${termoData.instituicao.endereco}
    `;
        return Buffer.from(mockPdfContent, 'utf-8');
    }
    generateHTMLTemplate(termoData, templateOptions) {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Termo de Entrega</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { max-width: 150px; }
          .title { font-size: 18px; font-weight: bold; margin: 20px 0; }
          .content { line-height: 1.6; }
          .field { margin: 10px 0; }
          .signature-area { margin-top: 50px; }
          .signature-line { border-bottom: 1px solid #000; width: 300px; margin: 30px 0 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          ${templateOptions?.logoPath ? `<img src="${templateOptions.logoPath}" class="logo" alt="Logo">` : ''}
          <h1>${termoData.instituicao.nome}</h1>
          <p>${termoData.instituicao.endereco}</p>
          ${termoData.instituicao.telefone ? `<p>Tel: ${termoData.instituicao.telefone}</p>` : ''}
        </div>
        
        <div class="title">TERMO DE ENTREGA DE DOCUMENTO</div>
        
        <div class="content">
          <div class="field"><strong>Código de Barras:</strong> ${termoData.desarquivamento.codigoBarras}</div>
          <div class="field"><strong>Número do Registro:</strong> ${termoData.desarquivamento.numeroRegistro}</div>
          <div class="field"><strong>Tipo de Solicitação:</strong> ${termoData.desarquivamento.tipoSolicitacao}</div>
          <div class="field"><strong>Solicitante:</strong> ${termoData.desarquivamento.nomeSolicitante}</div>
          ${termoData.desarquivamento.nomeVitima ? `<div class="field"><strong>Vítima:</strong> ${termoData.desarquivamento.nomeVitima}</div>` : ''}
          ${termoData.desarquivamento.finalidade ? `<div class="field"><strong>Finalidade:</strong> ${termoData.desarquivamento.finalidade}</div>` : ''}
          ${termoData.desarquivamento.localizacaoFisica ? `<div class="field"><strong>Localização:</strong> ${termoData.desarquivamento.localizacaoFisica}</div>` : ''}
          <div class="field"><strong>Data de Entrega:</strong> ${termoData.entrega.dataEntrega.toLocaleDateString('pt-BR')}</div>
          ${termoData.desarquivamento.urgente ? '<div class="field"><strong>URGENTE</strong></div>' : ''}
        </div>
        
        ${termoData.desarquivamento.observacoes
            ? `
          <div class="field">
            <strong>Observações:</strong><br>
            ${termoData.desarquivamento.observacoes}
          </div>
        `
            : ''}
        
        <div class="signature-area">
          <div>
            <div class="signature-line"></div>
            <p><strong>${termoData.entrega.responsavel.nome}</strong><br>
            ${termoData.entrega.responsavel.cargo}<br>
            Responsável pela Entrega</p>
          </div>
          
          <div style="margin-top: 40px;">
            <div class="signature-line"></div>
            <p><strong>${termoData.entrega.recebedor.nome}</strong><br>
            Documento: ___________________<br>
            Recebedor</p>
          </div>
        </div>
      </body>
      </html>
    `;
    }
    generateFileName(desarquivamento) {
        const plainObject = desarquivamento.toPlainObject();
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        return `termo_entrega_${plainObject.codigoBarras}_${timestamp}.pdf`;
    }
};
exports.GenerateTermoEntregaUseCase = GenerateTermoEntregaUseCase;
exports.GenerateTermoEntregaUseCase = GenerateTermoEntregaUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(nugecid_constants_1.DESARQUIVAMENTO_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object])
], GenerateTermoEntregaUseCase);
//# sourceMappingURL=generate-termo-entrega.use-case.js.map