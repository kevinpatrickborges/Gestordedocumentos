"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = require("bcryptjs");
const user_entity_1 = require("../src/modules/users/entities/user.entity");
const role_entity_1 = require("../src/modules/users/entities/role.entity");
const desarquivamento_entity_1 = require("../src/modules/nugecid/entities/desarquivamento.entity");
const tipo_solicitacao_vo_1 = require("../src/modules/nugecid/domain/value-objects/tipo-solicitacao.vo");
const test_setup_1 = require("./test-setup");
describe('ACL Validation Tests', () => {
    let module;
    let userRepository;
    let roleRepository;
    let desarquivamentoRepository;
    let adminUser;
    let editorUser1;
    let editorUser2;
    let regularUser;
    let adminRole;
    let editorRole;
    let userRole;
    beforeAll(async () => {
        module = await test_setup_1.TestSetup.createTestModule();
        userRepository = module.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
        roleRepository = module.get((0, typeorm_1.getRepositoryToken)(role_entity_1.Role));
        desarquivamentoRepository = module.get((0, typeorm_1.getRepositoryToken)(desarquivamento_entity_1.Desarquivamento));
        const roles = await test_setup_1.TestSetup.createTestRoles(roleRepository);
        adminRole = roles.adminRole;
        editorRole = roles.editorRole;
        userRole = roles.userRole;
        const users = await test_setup_1.TestSetup.createTestUsers(userRepository, roles);
        adminUser = users.adminUser;
        regularUser = users.regularUser;
        editorUser1 = userRepository.create({
            nome: 'Editor User 1',
            usuario: 'editor1',
            senha: await bcrypt.hash(test_setup_1.TEST_CONSTANTS.DEFAULT_PASSWORD, 12),
            role: editorRole,
            ativo: true,
            tentativasLogin: 0,
        });
        await userRepository.save(editorUser1);
        editorUser2 = userRepository.create({
            nome: 'Editor User 2',
            usuario: 'editor2',
            senha: await bcrypt.hash(test_setup_1.TEST_CONSTANTS.DEFAULT_PASSWORD, 12),
            role: editorRole,
            ativo: true,
            tentativasLogin: 0,
        });
        await userRepository.save(editorUser2);
    });
    afterAll(async () => {
        await module.close();
    });
    beforeEach(async () => {
        await desarquivamentoRepository.delete({});
    });
    describe('Role-based Access Control', () => {
        describe('Admin Role Permissions', () => {
            it('admin deve ter permissão para ver todos os registros', () => {
                expect(adminUser.isAdmin()).toBe(true);
                expect(adminUser.canViewAllRecords()).toBe(true);
                expect(adminRole.hasPermission('*')).toBe(true);
                expect(adminRole.isAdmin()).toBe(true);
            });
            it('admin deve poder acessar registros de qualquer usuário', async () => {
                const editorRecord = desarquivamentoRepository.create({
                    tipoSolicitacao: tipo_solicitacao_vo_1.TipoSolicitacaoEnum.COPIA,
                    nomeSolicitante: 'Editor Record',
                    numeroRegistro: '2024001',
                    finalidade: 'Test',
                    createdBy: editorUser1.id,
                    status: desarquivamento_entity_1.StatusDesarquivamento.PENDENTE,
                });
                await desarquivamentoRepository.save(editorRecord);
                expect(editorRecord.canBeAccessedBy(adminUser)).toBe(true);
                expect(editorRecord.canBeEditedBy(adminUser)).toBe(true);
                expect(editorRecord.canBeDeletedBy(adminUser)).toBe(true);
            });
        });
        describe('Editor Role Permissions', () => {
            it('editor deve ter permissões limitadas', () => {
                expect(editorUser1.isEditor()).toBe(true);
                expect(editorUser1.isAdmin()).toBe(false);
                expect(editorUser1.canViewAllRecords()).toBe(false);
                expect(editorRole.hasPermission('read')).toBe(true);
                expect(editorRole.hasPermission('write')).toBe(true);
                expect(editorRole.hasPermission('*')).toBe(false);
            });
            it('editor deve poder acessar apenas seus próprios registros', async () => {
                const ownRecord = desarquivamentoRepository.create({
                    tipoSolicitacao: tipo_solicitacao_vo_1.TipoSolicitacaoEnum.COPIA,
                    nomeSolicitante: 'Own Record',
                    numeroRegistro: '2024001',
                    finalidade: 'Test',
                    createdBy: editorUser1.id,
                    status: desarquivamento_entity_1.StatusDesarquivamento.PENDENTE,
                });
                await desarquivamentoRepository.save(ownRecord);
                const otherRecord = desarquivamentoRepository.create({
                    tipoSolicitacao: tipo_solicitacao_vo_1.TipoSolicitacaoEnum.COPIA,
                    nomeSolicitante: 'Other Record',
                    numeroRegistro: '2024002',
                    finalidade: 'Test',
                    createdBy: editorUser2.id,
                    status: desarquivamento_entity_1.StatusDesarquivamento.PENDENTE,
                });
                await desarquivamentoRepository.save(otherRecord);
                expect(ownRecord.canBeAccessedBy(editorUser1)).toBe(true);
                expect(ownRecord.canBeEditedBy(editorUser1)).toBe(true);
                expect(ownRecord.canBeDeletedBy(editorUser1)).toBe(true);
                expect(otherRecord.canBeAccessedBy(editorUser1)).toBe(false);
                expect(otherRecord.canBeEditedBy(editorUser1)).toBe(false);
                expect(otherRecord.canBeDeletedBy(editorUser1)).toBe(false);
            });
        });
        describe('Regular User Role Permissions', () => {
            it('usuário regular deve ter permissões mínimas', () => {
                expect(regularUser.isAdmin()).toBe(false);
                expect(regularUser.isEditor()).toBe(false);
                expect(regularUser.canViewAllRecords()).toBe(false);
                expect(userRole.hasPermission('read')).toBe(true);
                expect(userRole.hasPermission('write')).toBe(false);
                expect(userRole.hasPermission('*')).toBe(false);
            });
            it('usuário regular não deve poder editar ou deletar registros', async () => {
                const testRecord = desarquivamentoRepository.create({
                    tipoSolicitacao: tipo_solicitacao_vo_1.TipoSolicitacaoEnum.COPIA,
                    nomeSolicitante: 'Test Record',
                    numeroRegistro: '2024001',
                    finalidade: 'Test',
                    createdBy: editorUser1.id,
                    status: desarquivamento_entity_1.StatusDesarquivamento.PENDENTE,
                });
                await desarquivamentoRepository.save(testRecord);
                expect(testRecord.canBeAccessedBy(regularUser)).toBe(false);
                expect(testRecord.canBeEditedBy(regularUser)).toBe(false);
                expect(testRecord.canBeDeletedBy(regularUser)).toBe(false);
            });
        });
    });
    describe('Record-level Access Control', () => {
        let testRecord;
        beforeEach(async () => {
            testRecord = desarquivamentoRepository.create({
                tipoSolicitacao: tipo_solicitacao_vo_1.TipoSolicitacaoEnum.COPIA,
                nomeSolicitante: 'Test Record',
                numeroRegistro: '2024001',
                finalidade: 'Test Purpose',
                createdBy: editorUser1.id,
                status: desarquivamento_entity_1.StatusDesarquivamento.PENDENTE,
                urgente: false,
            });
            await desarquivamentoRepository.save(testRecord);
        });
        describe('canBeAccessedBy method', () => {
            it('deve permitir acesso ao criador do registro', () => {
                expect(testRecord.canBeAccessedBy(editorUser1)).toBe(true);
            });
            it('deve permitir acesso ao admin', () => {
                expect(testRecord.canBeAccessedBy(adminUser)).toBe(true);
            });
            it('deve negar acesso a outros editores', () => {
                expect(testRecord.canBeAccessedBy(editorUser2)).toBe(false);
            });
            it('deve negar acesso a usuários regulares', () => {
                expect(testRecord.canBeAccessedBy(regularUser)).toBe(false);
            });
            it('deve negar acesso a usuários inativos', async () => {
                const inactiveUser = userRepository.create({
                    nome: 'Inactive User',
                    usuario: 'inactive',
                    senha: await bcrypt.hash(test_setup_1.TEST_CONSTANTS.DEFAULT_PASSWORD, 12),
                    role: editorRole,
                    ativo: false,
                    tentativasLogin: 0,
                });
                await userRepository.save(inactiveUser);
                expect(testRecord.canBeAccessedBy(inactiveUser)).toBe(false);
            });
        });
        describe('canBeEditedBy method', () => {
            it('deve permitir edição pelo criador', () => {
                expect(testRecord.canBeEditedBy(editorUser1)).toBe(true);
            });
            it('deve permitir edição pelo admin', () => {
                expect(testRecord.canBeEditedBy(adminUser)).toBe(true);
            });
            it('deve negar edição a outros editores', () => {
                expect(testRecord.canBeEditedBy(editorUser2)).toBe(false);
            });
            it('deve negar edição a usuários regulares', () => {
                expect(testRecord.canBeEditedBy(regularUser)).toBe(false);
            });
            it('deve negar edição de registros concluídos por não-admin', async () => {
                testRecord.status = desarquivamento_entity_1.StatusDesarquivamento.CONCLUIDO;
                await desarquivamentoRepository.save(testRecord);
                expect(testRecord.canBeEditedBy(editorUser1)).toBe(false);
                expect(testRecord.canBeEditedBy(adminUser)).toBe(true);
            });
        });
        describe('canBeDeletedBy method', () => {
            it('deve permitir deleção pelo criador', () => {
                expect(testRecord.canBeDeletedBy(editorUser1)).toBe(true);
            });
            it('deve permitir deleção pelo admin', () => {
                expect(testRecord.canBeDeletedBy(adminUser)).toBe(true);
            });
            it('deve negar deleção a outros editores', () => {
                expect(testRecord.canBeDeletedBy(editorUser2)).toBe(false);
            });
            it('deve negar deleção a usuários regulares', () => {
                expect(testRecord.canBeDeletedBy(regularUser)).toBe(false);
            });
            it('deve negar deleção de registros em andamento por não-admin', async () => {
                testRecord.status = desarquivamento_entity_1.StatusDesarquivamento.EM_ANDAMENTO;
                await desarquivamentoRepository.save(testRecord);
                expect(testRecord.canBeDeletedBy(editorUser1)).toBe(false);
                expect(testRecord.canBeDeletedBy(adminUser)).toBe(true);
            });
        });
    });
    describe('Status-based Access Control', () => {
        let pendingRecord;
        let inProgressRecord;
        let completedRecord;
        let cancelledRecord;
        beforeEach(async () => {
            const baseRecord = {
                tipoSolicitacao: tipo_solicitacao_vo_1.TipoSolicitacaoEnum.COPIA,
                nomeSolicitante: 'Test Record',
                numeroRegistro: '2024001',
                finalidade: 'Test Purpose',
                createdBy: editorUser1.id,
                urgente: false,
            };
            pendingRecord = desarquivamentoRepository.create({
                ...baseRecord,
                status: desarquivamento_entity_1.StatusDesarquivamento.PENDENTE,
            });
            await desarquivamentoRepository.save(pendingRecord);
            inProgressRecord = desarquivamentoRepository.create({
                ...baseRecord,
                numeroRegistro: '2024002',
                status: desarquivamento_entity_1.StatusDesarquivamento.EM_ANDAMENTO,
            });
            await desarquivamentoRepository.save(inProgressRecord);
            completedRecord = desarquivamentoRepository.create({
                ...baseRecord,
                numeroRegistro: '2024003',
                status: desarquivamento_entity_1.StatusDesarquivamento.CONCLUIDO,
            });
            await desarquivamentoRepository.save(completedRecord);
            cancelledRecord = desarquivamentoRepository.create({
                ...baseRecord,
                numeroRegistro: '2024004',
                status: desarquivamento_entity_1.StatusDesarquivamento.CANCELADO,
            });
            await desarquivamentoRepository.save(cancelledRecord);
        });
        it('registros pendentes devem ser editáveis pelo criador', () => {
            expect(pendingRecord.canBeEditedBy(editorUser1)).toBe(true);
            expect(pendingRecord.canBeDeletedBy(editorUser1)).toBe(true);
        });
        it('registros em andamento devem ter edição limitada', () => {
            expect(inProgressRecord.canBeEditedBy(editorUser1)).toBe(true);
            expect(inProgressRecord.canBeDeletedBy(editorUser1)).toBe(false);
        });
        it('registros concluídos devem ser somente leitura para não-admin', () => {
            expect(completedRecord.canBeEditedBy(editorUser1)).toBe(false);
            expect(completedRecord.canBeDeletedBy(editorUser1)).toBe(false);
            expect(completedRecord.canBeAccessedBy(editorUser1)).toBe(true);
        });
        it('registros cancelados devem ser somente leitura para não-admin', () => {
            expect(cancelledRecord.canBeEditedBy(editorUser1)).toBe(false);
            expect(cancelledRecord.canBeDeletedBy(editorUser1)).toBe(false);
            expect(cancelledRecord.canBeAccessedBy(editorUser1)).toBe(true);
        });
        it('admin deve poder editar registros em qualquer status', () => {
            expect(pendingRecord.canBeEditedBy(adminUser)).toBe(true);
            expect(inProgressRecord.canBeEditedBy(adminUser)).toBe(true);
            expect(completedRecord.canBeEditedBy(adminUser)).toBe(true);
            expect(cancelledRecord.canBeEditedBy(adminUser)).toBe(true);
        });
        it('admin deve poder deletar registros em qualquer status', () => {
            expect(pendingRecord.canBeDeletedBy(adminUser)).toBe(true);
            expect(inProgressRecord.canBeDeletedBy(adminUser)).toBe(true);
            expect(completedRecord.canBeDeletedBy(adminUser)).toBe(true);
            expect(cancelledRecord.canBeDeletedBy(adminUser)).toBe(true);
        });
    });
    describe('User State Validation', () => {
        it('usuários bloqueados não devem ter acesso', async () => {
            const blockedUser = userRepository.create({
                nome: 'Blocked User',
                usuario: 'blocked',
                senha: await bcrypt.hash(test_setup_1.TEST_CONSTANTS.DEFAULT_PASSWORD, 12),
                role: editorRole,
                ativo: true,
                tentativasLogin: 5,
                bloqueadoAte: new Date(Date.now() + 3600000),
            });
            await userRepository.save(blockedUser);
            const testRecord = desarquivamentoRepository.create({
                tipoSolicitacao: tipo_solicitacao_vo_1.TipoSolicitacaoEnum.COPIA,
                nomeSolicitante: 'Test Record',
                numeroRegistro: '2024002',
                finalidade: 'Test',
                createdBy: editorUser1.id,
                status: desarquivamento_entity_1.StatusDesarquivamento.PENDENTE,
            });
            await desarquivamentoRepository.save(testRecord);
            expect(blockedUser.isBlocked()).toBe(true);
            expect(testRecord.canBeAccessedBy(blockedUser)).toBe(false);
            expect(testRecord.canBeEditedBy(blockedUser)).toBe(false);
            expect(testRecord.canBeDeletedBy(blockedUser)).toBe(false);
        });
        it('usuários inativos não devem ter acesso', async () => {
            const inactiveUser = userRepository.create({
                nome: 'Inactive User',
                usuario: 'inactive2',
                senha: await bcrypt.hash(test_setup_1.TEST_CONSTANTS.DEFAULT_PASSWORD, 12),
                role: editorRole,
                ativo: false,
                tentativasLogin: 0,
            });
            await userRepository.save(inactiveUser);
            const testRecord = desarquivamentoRepository.create({
                tipoSolicitacao: tipo_solicitacao_vo_1.TipoSolicitacaoEnum.COPIA,
                nomeSolicitante: 'Test Record',
                numeroRegistro: '2024001',
                finalidade: 'Test',
                createdBy: inactiveUser.id,
                status: desarquivamento_entity_1.StatusDesarquivamento.PENDENTE,
            });
            await desarquivamentoRepository.save(testRecord);
            expect(testRecord.canBeAccessedBy(inactiveUser)).toBe(false);
            expect(testRecord.canBeEditedBy(inactiveUser)).toBe(false);
            expect(testRecord.canBeDeletedBy(inactiveUser)).toBe(false);
        });
    });
    describe('Cross-user Access Scenarios', () => {
        it('deve validar cenários complexos de acesso cruzado', async () => {
            const adminRecord = desarquivamentoRepository.create({
                tipoSolicitacao: tipo_solicitacao_vo_1.TipoSolicitacaoEnum.COPIA,
                nomeSolicitante: 'Admin Record',
                numeroRegistro: '2024001',
                finalidade: 'Admin Test',
                createdBy: adminUser.id,
                status: desarquivamento_entity_1.StatusDesarquivamento.PENDENTE,
            });
            await desarquivamentoRepository.save(adminRecord);
            const editor1Record = desarquivamentoRepository.create({
                tipoSolicitacao: tipo_solicitacao_vo_1.TipoSolicitacaoEnum.COPIA,
                nomeSolicitante: 'Editor 1 Record',
                numeroRegistro: '2024002',
                finalidade: 'Editor 1 Test',
                createdBy: editorUser1.id,
                status: desarquivamento_entity_1.StatusDesarquivamento.EM_ANDAMENTO,
            });
            await desarquivamentoRepository.save(editor1Record);
            const editor2Record = desarquivamentoRepository.create({
                tipoSolicitacao: tipo_solicitacao_vo_1.TipoSolicitacaoEnum.COPIA,
                nomeSolicitante: 'Editor 2 Record',
                numeroRegistro: '2024003',
                finalidade: 'Editor 2 Test',
                createdBy: editorUser2.id,
                status: desarquivamento_entity_1.StatusDesarquivamento.CONCLUIDO,
            });
            await desarquivamentoRepository.save(editor2Record);
            expect(adminRecord.canBeAccessedBy(adminUser)).toBe(true);
            expect(editor1Record.canBeAccessedBy(adminUser)).toBe(true);
            expect(editor2Record.canBeAccessedBy(adminUser)).toBe(true);
            expect(adminRecord.canBeAccessedBy(editorUser1)).toBe(false);
            expect(editor1Record.canBeAccessedBy(editorUser1)).toBe(true);
            expect(editor2Record.canBeAccessedBy(editorUser1)).toBe(false);
            expect(adminRecord.canBeAccessedBy(editorUser2)).toBe(false);
            expect(editor1Record.canBeAccessedBy(editorUser2)).toBe(false);
            expect(editor2Record.canBeAccessedBy(editorUser2)).toBe(true);
            expect(adminRecord.canBeAccessedBy(regularUser)).toBe(false);
            expect(editor1Record.canBeAccessedBy(regularUser)).toBe(false);
            expect(editor2Record.canBeAccessedBy(regularUser)).toBe(false);
        });
    });
});
//# sourceMappingURL=acl-validation.spec.js.map