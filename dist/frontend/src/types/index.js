"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = exports.TipoDesarquivamento = exports.StatusDesarquivamento = exports.TipoSolicitacao = void 0;
var TipoSolicitacao;
(function (TipoSolicitacao) {
    TipoSolicitacao["DESARQUIVAMENTO"] = "DESARQUIVAMENTO";
    TipoSolicitacao["COPIA"] = "COPIA";
    TipoSolicitacao["VISTA"] = "VISTA";
    TipoSolicitacao["CERTIDAO"] = "CERTIDAO";
})(TipoSolicitacao || (exports.TipoSolicitacao = TipoSolicitacao = {}));
var StatusDesarquivamento;
(function (StatusDesarquivamento) {
    StatusDesarquivamento["FINALIZADO"] = "FINALIZADO";
    StatusDesarquivamento["DESARQUIVADO"] = "DESARQUIVADO";
    StatusDesarquivamento["NAO_COLETADO"] = "NAO_COLETADO";
    StatusDesarquivamento["SOLICITADO"] = "SOLICITADO";
    StatusDesarquivamento["REARQUIVAMENTO_SOLICITADO"] = "REARQUIVAMENTO_SOLICITADO";
    StatusDesarquivamento["RETIRADO_PELO_SETOR"] = "RETIRADO_PELO_SETOR";
    StatusDesarquivamento["NAO_LOCALIZADO"] = "NAO_LOCALIZADO";
})(StatusDesarquivamento || (exports.StatusDesarquivamento = StatusDesarquivamento = {}));
var TipoDesarquivamento;
(function (TipoDesarquivamento) {
    TipoDesarquivamento["FISICO"] = "FISICO";
    TipoDesarquivamento["DIGITAL"] = "DIGITAL";
    TipoDesarquivamento["NAO_LOCALIZADO"] = "NAO_LOCALIZADO";
})(TipoDesarquivamento || (exports.TipoDesarquivamento = TipoDesarquivamento = {}));
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["COORDENADOR"] = "coordenador";
    UserRole["USUARIO"] = "usuario";
})(UserRole || (exports.UserRole = UserRole = {}));
//# sourceMappingURL=index.js.map