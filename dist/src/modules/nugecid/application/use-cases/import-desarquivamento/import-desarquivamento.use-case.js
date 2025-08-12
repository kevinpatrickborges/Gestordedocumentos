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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportDesarquivamentoUseCase = void 0;
const common_1 = require("@nestjs/common");
const xlsx = require("xlsx");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const create_desarquivamento_dto_1 = require("../../../dto/create-desarquivamento.dto");
const create_desarquivamento_use_case_1 = require("../create-desarquivamento/create-desarquivamento.use-case");
let ImportDesarquivamentoUseCase = class ImportDesarquivamentoUseCase {
    constructor(createDesarquivamentoUseCase) {
        this.createDesarquivamentoUseCase = createDesarquivamentoUseCase;
    }
    async execute(fileBuffer, criadoPorId = 1) {
        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);
        const result = {
            totalRows: data.length,
            successCount: 0,
            errorCount: 0,
            errors: [],
        };
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const dto = (0, class_transformer_1.plainToClass)(create_desarquivamento_dto_1.CreateDesarquivamentoDto, row);
            const validationErrors = await (0, class_validator_1.validate)(dto);
            if (validationErrors.length > 0) {
                result.errorCount++;
                result.errors.push({ row: i + 2, details: validationErrors });
            }
            else {
                try {
                    const request = {
                        tipoSolicitacao: dto.tipoSolicitacao,
                        nomeSolicitante: dto.nomeSolicitante,
                        nomeVitima: dto.nomeVitima,
                        numeroRegistro: dto.numeroRegistro,
                        tipoDocumento: dto.tipoDocumento,
                        dataFato: dto.dataFato,
                        prazoAtendimento: dto.prazoAtendimento,
                        finalidade: dto.finalidade,
                        observacoes: dto.observacoes,
                        urgente: dto.urgente || false,
                        localizacaoFisica: dto.localizacaoFisica,
                        criadoPorId,
                        responsavelId: dto.responsavelId
                    };
                    await this.createDesarquivamentoUseCase.execute(request);
                    result.successCount++;
                }
                catch (error) {
                    result.errorCount++;
                    result.errors.push({ row: i + 2, details: error.message });
                }
            }
        }
        return result;
    }
};
exports.ImportDesarquivamentoUseCase = ImportDesarquivamentoUseCase;
exports.ImportDesarquivamentoUseCase = ImportDesarquivamentoUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [create_desarquivamento_use_case_1.CreateDesarquivamentoUseCase])
], ImportDesarquivamentoUseCase);
//# sourceMappingURL=import-desarquivamento.use-case.js.map