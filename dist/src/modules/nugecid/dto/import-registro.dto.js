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
exports.ImportRegistroDto = exports.StatusDesarquivamento = exports.TipoDesarquivamento = void 0;
const class_validator_1 = require("class-validator");
var TipoDesarquivamento;
(function (TipoDesarquivamento) {
    TipoDesarquivamento["FISICO"] = "F\u00EDsico";
    TipoDesarquivamento["DIGITAL"] = "Digital";
    TipoDesarquivamento["NAO_LOCALIZADO"] = "N\u00E3o Localizado";
})(TipoDesarquivamento || (exports.TipoDesarquivamento = TipoDesarquivamento = {}));
var StatusDesarquivamento;
(function (StatusDesarquivamento) {
    StatusDesarquivamento["FINALIZADO"] = "Finalizado";
    StatusDesarquivamento["DESARQUIVADO"] = "Desarquivado";
    StatusDesarquivamento["NAO_COLETADO"] = "N\u00E3o coletado";
    StatusDesarquivamento["SOLICITADO"] = "Solicitado";
    StatusDesarquivamento["REARQUIVAMENTO_SOLICITADO"] = "Rearquivamento Solicitado";
    StatusDesarquivamento["RETIRADO_PELO_SETOR"] = "Retirado pelo setor";
    StatusDesarquivamento["NAO_LOCALIZADO"] = "N\u00E3o Localizado";
})(StatusDesarquivamento || (exports.StatusDesarquivamento = StatusDesarquivamento = {}));
class ImportRegistroDto {
}
exports.ImportRegistroDto = ImportRegistroDto;
__decorate([
    (0, class_validator_1.IsEnum)(TipoDesarquivamento, { message: 'O valor para a coluna "DESARQUIVAMENTO FÍSICO/DIGITAL" é inválido.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'A coluna "DESARQUIVAMENTO FÍSICO/DIGITAL" é obrigatória.' }),
    __metadata("design:type", String)
], ImportRegistroDto.prototype, "desarquivamentoTipo", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(StatusDesarquivamento, { message: 'O valor para a coluna "Status" é inválido.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'A coluna "Status" é obrigatória.' }),
    __metadata("design:type", String)
], ImportRegistroDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'A coluna "Nome Completo" é obrigatória.' }),
    __metadata("design:type", String)
], ImportRegistroDto.prototype, "nomeCompleto", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'A coluna "Nº DO NIC/LAUDO/AUTO/INFORMAÇÃO TÉCNICA" é obrigatória.' }),
    __metadata("design:type", String)
], ImportRegistroDto.prototype, "numDocumento", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ImportRegistroDto.prototype, "numProcesso", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ImportRegistroDto.prototype, "tipoDocumento", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'A "Data de solicitação" deve ser uma data válida.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'A coluna "Data de solicitação" é obrigatória.' }),
    __metadata("design:type", String)
], ImportRegistroDto.prototype, "dataSolicitacao", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'A "Data do desarquivamento - SAG" deve ser uma data válida.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ImportRegistroDto.prototype, "dataDesarquivamento", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'A "Data da devolução pelo setor" deve ser uma data válida.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ImportRegistroDto.prototype, "dataDevolucao", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ImportRegistroDto.prototype, "setorDemandante", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ImportRegistroDto.prototype, "servidorResponsavel", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ImportRegistroDto.prototype, "finalidade", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)({ message: 'A coluna de "Prorrogação" deve ser um valor booleano (sim/não ou true/false).' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ImportRegistroDto.prototype, "prorrogacao", void 0);
//# sourceMappingURL=import-registro.dto.js.map