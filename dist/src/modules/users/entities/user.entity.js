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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const bcrypt = require("bcryptjs");
const role_entity_1 = require("./role.entity");
const desarquivamento_entity_1 = require("../../nugecid/entities/desarquivamento.entity");
const auditoria_entity_1 = require("../../audit/entities/auditoria.entity");
let User = class User {
    async hashPassword() {
        if (this.senha &&
            !this.senha.startsWith('$2a$') &&
            !this.senha.startsWith('$2b$') &&
            !this.senha.startsWith('$2y$')) {
            this.senha = await bcrypt.hash(this.senha, 12);
        }
    }
    async validatePassword(password) {
        return bcrypt.compare(password, this.senha);
    }
    isAdmin() {
        return this.role?.name.toLowerCase() === 'admin';
    }
    isEditor() {
        return this.role?.name.toLowerCase() === 'editor';
    }
    canManageUser(targetUserId) {
        return this.isAdmin() || this.id === targetUserId;
    }
    canViewAllRecords() {
        return this.isAdmin();
    }
    isBlocked() {
        return this.bloqueadoAte && this.bloqueadoAte > new Date();
    }
    toJSON() {
        const { senha, tokenReset, tokenResetExpira, ...result } = this;
        return result;
    }
    serialize() {
        const { senha, tokenReset, tokenResetExpira, ...result } = this;
        return result;
    }
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: false }),
    __metadata("design:type", String)
], User.prototype, "nome", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, unique: true, nullable: false }),
    __metadata("design:type", String)
], User.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: false }),
    __metadata("design:type", String)
], User.prototype, "senha", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'role_id', nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "roleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => role_entity_1.Role, role => role.users, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'role_id' }),
    __metadata("design:type", role_entity_1.Role)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ultimo_login', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "ultimoLogin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ativo', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "ativo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tentativas_login', type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "tentativasLogin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bloqueado_ate', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "bloqueadoAte", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'token_reset', length: 255, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "tokenReset", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'token_reset_expira', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "tokenResetExpira", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at' }),
    __metadata("design:type", Date)
], User.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => desarquivamento_entity_1.Desarquivamento, desarquivamento => desarquivamento.criadoPor),
    __metadata("design:type", Array)
], User.prototype, "desarquivamentos", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => auditoria_entity_1.Auditoria, auditoria => auditoria.user),
    __metadata("design:type", Array)
], User.prototype, "auditorias", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], User.prototype, "hashPassword", null);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('usuarios')
], User);
//# sourceMappingURL=user.entity.js.map