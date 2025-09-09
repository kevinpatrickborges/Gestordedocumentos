"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
class Role {
    constructor(props) {
        this.validateProps(props);
        this._id = props.id;
        this._nome = props.nome;
        this._descricao = props.descricao;
        const permissoesArray = Array.isArray(props.permissoes) ? props.permissoes : [];
        this._permissoes = permissoesArray.slice();
        this._createdAt = props.createdAt || new Date();
        this._updatedAt = props.updatedAt || new Date();
    }
    validateProps(props) {
        if (!props.nome || props.nome.trim().length === 0) {
            throw new Error('Nome da role é obrigatório');
        }
    }
    get id() {
        return this._id;
    }
    get nome() {
        return this._nome;
    }
    get descricao() {
        return this._descricao;
    }
    get permissoes() {
        return [...this._permissoes];
    }
    get createdAt() {
        return this._createdAt;
    }
    get updatedAt() {
        return this._updatedAt;
    }
    hasPermission(permission) {
        return this._permissoes.includes(permission);
    }
    addPermission(permission) {
        if (!this._permissoes.includes(permission)) {
            this._permissoes.push(permission);
            this._updatedAt = new Date();
        }
    }
    removePermission(permission) {
        const index = this._permissoes.indexOf(permission);
        if (index > -1) {
            this._permissoes.splice(index, 1);
            this._updatedAt = new Date();
        }
    }
    updateDescricao(descricao) {
        this._descricao = descricao;
        this._updatedAt = new Date();
    }
    equals(other) {
        if (!this._id || !other._id) {
            return false;
        }
        return this._id.equals(other._id);
    }
}
exports.Role = Role;
//# sourceMappingURL=role.js.map