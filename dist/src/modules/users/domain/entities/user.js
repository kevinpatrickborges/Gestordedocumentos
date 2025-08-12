"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const password_1 = require("../value-objects/password");
class User {
    constructor(props) {
        this.validateProps(props);
        this._id = props.id;
        this._nome = props.nome;
        this._usuario = props.usuario;
        this._password = props.password;
        this._roleId = props.roleId;
        this._role = props.role;
        this._ativo = props.ativo ?? true;
        this._createdAt = props.createdAt || new Date();
        this._updatedAt = props.updatedAt || new Date();
        this._deletedAt = props.deletedAt;
    }
    validateProps(props) {
        if (!props.nome || props.nome.trim().length === 0) {
            throw new Error('Nome do usuário é obrigatório');
        }
        if (props.nome.trim().length < 2) {
            throw new Error('Nome deve ter pelo menos 2 caracteres');
        }
        if (!props.usuario) {
            throw new Error('Usuário é obrigatório');
        }
        if (!props.password) {
            throw new Error('Senha é obrigatória');
        }
        if (!props.roleId) {
            throw new Error('Role é obrigatória');
        }
    }
    get id() {
        return this._id;
    }
    get nome() {
        return this._nome;
    }
    get usuario() {
        return this._usuario;
    }
    get password() {
        return this._password;
    }
    get roleId() {
        return this._roleId;
    }
    get role() {
        return this._role;
    }
    get ativo() {
        return this._ativo;
    }
    get createdAt() {
        return this._createdAt;
    }
    get updatedAt() {
        return this._updatedAt;
    }
    get deletedAt() {
        return this._deletedAt;
    }
    get isDeleted() {
        return this._deletedAt !== undefined;
    }
    updateNome(nome) {
        if (!nome || nome.trim().length === 0) {
            throw new Error('Nome não pode estar vazio');
        }
        if (nome.trim().length < 2) {
            throw new Error('Nome deve ter pelo menos 2 caracteres');
        }
        this._nome = nome.trim();
        this._updatedAt = new Date();
    }
    updateUsuario(usuario) {
        this._usuario = usuario;
        this._updatedAt = new Date();
    }
    async updatePassword(newPassword) {
        this._password = await password_1.Password.create(newPassword);
        this._updatedAt = new Date();
    }
    updateRole(roleId, role) {
        this._roleId = roleId;
        this._role = role;
        this._updatedAt = new Date();
    }
    activate() {
        this._ativo = true;
        this._updatedAt = new Date();
    }
    deactivate() {
        this._ativo = false;
        this._updatedAt = new Date();
    }
    softDelete() {
        this._deletedAt = new Date();
        this._ativo = false;
        this._updatedAt = new Date();
    }
    restore() {
        this._deletedAt = undefined;
        this._ativo = true;
        this._updatedAt = new Date();
    }
    async validatePassword(plainPassword) {
        return this._password.isValid(plainPassword);
    }
    hasPermission(permission) {
        if (!this._role) {
            return false;
        }
        return this._role.hasPermission(permission);
    }
    equals(other) {
        if (!this._id || !other._id) {
            return false;
        }
        return this._id.equals(other._id);
    }
}
exports.User = User;
//# sourceMappingURL=user.js.map