import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import * as path from 'path';
import * as XLSX from 'xlsx';

import { NugecidModule } from '../src/modules/nugecid/nugecid.module';
import { AuthModule } from '../src/modules/auth/auth.module';
import { UsersModule } from '../src/modules/users/users.module';
import { AuditoriaModule } from '../src/modules/audit/auditoria.module';
import { User } from '../src/modules/users/entities/user.entity';
import { Role } from '../src/modules/users/entities/role.entity';
import { Desarquivamento, StatusDesarquivamento } from '../src/modules/nugecid/entities/desarquivamento.entity';
import { TipoSolicitacaoEnum } from '../src/modules/nugecid/domain/value-objects/tipo-solicitacao.vo';
import { AuditAction, Auditoria } from '../src/modules/audit/entities/auditoria.entity';
import { CreateDesarquivamentoDto } from '../src/modules/nugecid/dto/create-desarquivamento.dto';
import { UpdateDesarquivamentoDto } from '../src/modules/nugecid/dto/update-desarquivamento.dto';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/modules/auth/guards/roles.guard';
import { AppModule } from '../src/app.module';

describe('NUGECID Integration Tests', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let roleRepository: Repository<Role>;
  let desarquivamentoRepository: Repository<Desarquivamento>;
  let auditoriaRepository: Repository<Auditoria>;
  let jwtService: JwtService;

  let adminUser: User;
  let editorUser: User;
  let adminToken: string;
  let editorToken: string;
  let adminRole: Role;
  let editorRole: Role;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
        }),

        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    roleRepository = moduleFixture.get<Repository<Role>>(getRepositoryToken(Role));
    desarquivamentoRepository = moduleFixture.get<Repository<Desarquivamento>>(
      getRepositoryToken(Desarquivamento),
    );
    auditoriaRepository = moduleFixture.get<Repository<Auditoria>>(getRepositoryToken(Auditoria));
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  beforeEach(async () => {
    await desarquivamentoRepository.clear();
    await auditoriaRepository.clear();
    await userRepository.clear();
    await roleRepository.clear();

    adminRole = await roleRepository.save({
      name: 'admin',
      description: 'Administrator',
      permissions: ['*'],
      ativo: true,
    });

    editorRole = await roleRepository.save({
      name: 'editor',
      description: 'Editor',
      permissions: ['read', 'write', 'delete'],
      ativo: true,
    });

    adminUser = await userRepository.save({
      nome: 'Admin User',
      usuario: 'admin',
      senha: await bcrypt.hash('admin123', 12),
      role: adminRole,
      ativo: true,
    });

    editorUser = await userRepository.save({
      nome: 'Editor User',
      usuario: 'editor',
      senha: await bcrypt.hash('editor123', 12),
      role: editorRole,
      ativo: true,
    });

    adminToken = jwtService.sign({ sub: adminUser.id, usuario: adminUser.usuario, role: adminUser.role.name });
    editorToken = jwtService.sign({ sub: editorUser.id, usuario: editorUser.usuario, role: editorUser.role.name });
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /nugecid/import-registros', () => {
    it('deve rejeitar importação por usuário não-admin', async () => {
      const buffer = Buffer.from('qualquer conteudo');
      await request(app.getHttpServer())
        .post('/nugecid/import-registros')
        .set('Authorization', `Bearer ${editorToken}`)
        .attach('file', buffer, 'test.xlsx')
        .expect(403);
    });

    it('deve importar registros com sucesso de um arquivo .xlsx', async () => {
      const validData = [
        { 'Nome Solicitante': 'Requerente Valido', 'Nome Vitima': 'Vitima Valida', 'Nº Registro': 'RG123', 'Tipo Solicitação': 'COPIA', 'Data Fato': '2023-01-15', 'Observacoes': 'Tudo certo' },
        { 'Nome Solicitante': 'Outro Requerente', 'Nome Vitima': 'Outra Vitima', 'Nº Registro': 'RG456', 'Tipo Solicitação': 'VISTA', 'Data Fato': '2023-02-20', 'Observacoes': '' },
      ];
      const worksheet = XLSX.utils.json_to_sheet(validData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Registros');
      const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

      const response = await request(app.getHttpServer())
        .post('/nugecid/import-registros')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', buffer, 'registros.xlsx')
        .expect(201);

      expect(response.body.totalRows).toBe(2);
      expect(response.body.successCount).toBe(2);
      expect(response.body.errorCount).toBe(0);

      const allRecords = await desarquivamentoRepository.find();
      expect(allRecords).toHaveLength(2);
      expect(allRecords[0].nomeSolicitante).toBe('Requerente Valido');
    });

    it('deve retornar erros para linhas inválidas e salvar as válidas', async () => {
      const mixedData = [
        { 'Nome Solicitante': 'Valido 1', 'Nº Registro': 'RG789', 'Tipo Solicitação': 'COPIA', 'Data Fato': '2023-03-10' },
        { 'Nome Solicitante': '', 'Nº Registro': 'RG101', 'Tipo Solicitação': 'VISTA', 'Data Fato': '2023-04-05' },
      ];
      const worksheet = XLSX.utils.json_to_sheet(mixedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Registros');
      const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

      const response = await request(app.getHttpServer())
        .post('/nugecid/import-registros')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', buffer, 'registros-com-erros.xlsx')
        .expect(201);

      expect(response.body.successCount).toBe(1);
      expect(response.body.errorCount).toBe(1);
      expect(response.body.errors[0].details.message).toContain('nomeSolicitante should not be empty');

      const allRecords = await desarquivamentoRepository.find();
      expect(allRecords).toHaveLength(1);
    });
  });

  describe('POST /nugecid', () => {
    const createDto: CreateDesarquivamentoDto = {
      tipoSolicitacao: TipoSolicitacaoEnum.COPIA,
      nomeSolicitante: 'João Silva',
      numeroRegistro: '2024001',
      finalidade: 'Processo judicial',
      urgente: false,
    };

    it('deve criar desarquivamento com token válido', async () => {
      const response = await request(app.getHttpServer())
        .post('/nugecid')
        .set('Authorization', `Bearer ${editorToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.nomeSolicitante).toBe(createDto.nomeSolicitante);
      expect(response.body.criadoPor.id).toBe(editorUser.id);
    });

    it('deve rejeitar sem token', async () => {
      await request(app.getHttpServer()).post('/nugecid').send(createDto).expect(401);
    });

    it('deve validar dados de entrada', async () => {
      await request(app.getHttpServer())
        .post('/nugecid')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ tipoSolicitacao: 'INVALIDO' })
        .expect(400);
    });

    it('deve registrar auditoria ao criar', async () => {
      const res = await request(app.getHttpServer())
        .post('/nugecid')
        .set('Authorization', `Bearer ${editorToken}`)
        .send(createDto)
        .expect(201);

      const auditoria = await auditoriaRepository.findOne({ where: { entityId: res.body.id, action: AuditAction.CREATE } });
      expect(auditoria).toBeDefined();
      expect(auditoria.user.id).toBe(editorUser.id);
    });
  });

  describe('GET /nugecid', () => {
    beforeEach(async () => {
      await desarquivamentoRepository.save([
        desarquivamentoRepository.create({ tipoSolicitacao: TipoSolicitacaoEnum.COPIA, nomeSolicitante: 'Admin Record', criadoPor: adminUser }),
        desarquivamentoRepository.create({ tipoSolicitacao: TipoSolicitacaoEnum.VISTA, nomeSolicitante: 'Editor Record', criadoPor: editorUser }),
      ]);
    });

    it('admin deve ver todos os registros', async () => {
      const res = await request(app.getHttpServer()).get('/nugecid').set('Authorization', `Bearer ${adminToken}`).expect(200);
      expect(res.body.desarquivamentos).toHaveLength(2);
    });

    it('editor deve ver apenas seus registros', async () => {
      const res = await request(app.getHttpServer()).get('/nugecid').set('Authorization', `Bearer ${editorToken}`).expect(200);
      expect(res.body.desarquivamentos).toHaveLength(1);
      expect(res.body.desarquivamentos[0].nomeSolicitante).toBe('Editor Record');
    });

    it('deve aplicar paginação', async () => {
      const res = await request(app.getHttpServer()).get('/nugecid?page=1&limit=1').set('Authorization', `Bearer ${adminToken}`).expect(200);
      expect(res.body.desarquivamentos).toHaveLength(1);
      expect(res.body.total).toBe(2);
    });

    it('deve aplicar filtros de busca', async () => {
      const res = await request(app.getHttpServer()).get('/nugecid?search=Editor').set('Authorization', `Bearer ${adminToken}`).expect(200);
      expect(res.body.desarquivamentos).toHaveLength(1);
      expect(res.body.desarquivamentos[0].nomeSolicitante).toBe('Editor Record');
    });
  });

  describe('GET /nugecid/:id', () => {
    let record: Desarquivamento;
    beforeEach(async () => {
      record = await desarquivamentoRepository.save(
        desarquivamentoRepository.create({ tipoSolicitacao: TipoSolicitacaoEnum.COPIA, nomeSolicitante: 'Test Record', criadoPor: editorUser })
      );
    });

    it('deve retornar registro se usuário tem acesso', async () => {
      const res = await request(app.getHttpServer()).get(`/nugecid/${record.id}`).set('Authorization', `Bearer ${editorToken}`).expect(200);
      expect(res.body.id).toBe(record.id);
    });

    it('admin deve acessar qualquer registro', async () => {
      const res = await request(app.getHttpServer()).get(`/nugecid/${record.id}`).set('Authorization', `Bearer ${adminToken}`).expect(200);
      expect(res.body.id).toBe(record.id);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      await request(app.getHttpServer()).get('/nugecid/99999').set('Authorization', `Bearer ${adminToken}`).expect(404);
    });

    it('deve retornar 403 se editor tenta acessar registro de outro', async () => {
        const otherEditor = await userRepository.save({ nome: 'Other', usuario: 'other', senha: '123', role: editorRole });
        const otherToken = jwtService.sign({ sub: otherEditor.id, usuario: otherEditor.usuario, role: otherEditor.role.name });
        await request(app.getHttpServer()).get(`/nugecid/${record.id}`).set('Authorization', `Bearer ${otherToken}`).expect(403);
    });
  });

  describe('PATCH /nugecid/:id', () => {
    let record: Desarquivamento;
    const updateDto: UpdateDesarquivamentoDto = { status: StatusDesarquivamento.EM_ANDAMENTO, observacoes: 'Atualizado' };

    beforeEach(async () => {
      record = await desarquivamentoRepository.save(
        desarquivamentoRepository.create({ tipoSolicitacao: TipoSolicitacaoEnum.COPIA, nomeSolicitante: 'To Update', criadoPor: editorUser })
      );
    });

    it('deve atualizar se usuário pode editar', async () => {
      const res = await request(app.getHttpServer()).patch(`/nugecid/${record.id}`).set('Authorization', `Bearer ${editorToken}`).send(updateDto).expect(200);
      expect(res.body.status).toBe(updateDto.status);
      expect(res.body.observacoes).toBe(updateDto.observacoes);
    });

    it('admin deve poder atualizar qualquer registro', async () => {
      const res = await request(app.getHttpServer()).patch(`/nugecid/${record.id}`).set('Authorization', `Bearer ${adminToken}`).send(updateDto).expect(200);
      expect(res.body.status).toBe(updateDto.status);
    });

    it('deve registrar auditoria ao atualizar', async () => {
      await request(app.getHttpServer()).patch(`/nugecid/${record.id}`).set('Authorization', `Bearer ${editorToken}`).send(updateDto).expect(200);
      const auditoria = await auditoriaRepository.findOne({ where: { entityId: record.id, action: AuditAction.UPDATE } });
      expect(auditoria).toBeDefined();
    });
  });

  describe('DELETE /nugecid/:id', () => {
    let record: Desarquivamento;
    beforeEach(async () => {
      record = await desarquivamentoRepository.save(
        desarquivamentoRepository.create({ tipoSolicitacao: TipoSolicitacaoEnum.COPIA, nomeSolicitante: 'To Delete', criadoPor: editorUser })
      );
    });

    it('deve fazer soft delete se usuário pode deletar', async () => {
      await request(app.getHttpServer()).delete(`/nugecid/${record.id}`).set('Authorization', `Bearer ${editorToken}`).expect(200);
      const deleted = await desarquivamentoRepository.findOne({ where: { id: record.id }, withDeleted: true });
      expect(deleted.deletedAt).not.toBeNull();
    });

    it('admin deve poder deletar qualquer registro', async () => {
      await request(app.getHttpServer()).delete(`/nugecid/${record.id}`).set('Authorization', `Bearer ${adminToken}`).expect(200);
      const deleted = await desarquivamentoRepository.findOne({ where: { id: record.id }, withDeleted: true });
      expect(deleted.deletedAt).not.toBeNull();
    });

    it('deve registrar auditoria ao deletar', async () => {
      await request(app.getHttpServer()).delete(`/nugecid/${record.id}`).set('Authorization', `Bearer ${editorToken}`).expect(200);
      const auditoria = await auditoriaRepository.findOne({ where: { entityId: record.id, action: AuditAction.DELETE } });
      expect(auditoria).toBeDefined();
    });
  });

  describe('GET /nugecid/barcode/:codigo', () => {
    let record: Desarquivamento;
    beforeEach(async () => {
      record = await desarquivamentoRepository.save(
        desarquivamentoRepository.create({ nomeSolicitante: 'Barcode Test', tipoSolicitacao: TipoSolicitacaoEnum.COPIA })
      );
    });

    it('deve encontrar por código de barras', async () => {
      const res = await request(app.getHttpServer()).get(`/nugecid/barcode/${record.codigoBarras}`).expect(200);
      expect(res.body.id).toBe(record.id);
    });
  });

    it('deve retornar 404 para código inexistente', async () => {
        await request(app.getHttpServer()).get('/nugecid/barcode/INVALID123').expect(404);
    });
  // });

  describe('GET /nugecid/dashboard', () => {
    beforeEach(async () => {
      await desarquivamentoRepository.save([
        desarquivamentoRepository.create({ tipoSolicitacao: TipoSolicitacaoEnum.COPIA, nomeSolicitante: 'R1', criadoPor: adminUser, status: StatusDesarquivamento.PENDENTE }),
        desarquivamentoRepository.create({ tipoSolicitacao: TipoSolicitacaoEnum.VISTA, nomeSolicitante: 'R2', criadoPor: editorUser, status: StatusDesarquivamento.EM_ANDAMENTO }),
        desarquivamentoRepository.create({ tipoSolicitacao: TipoSolicitacaoEnum.VISTA, nomeSolicitante: 'R3', criadoPor: editorUser, status: StatusDesarquivamento.CONCLUIDO }),
      ]);
    });

    it('admin deve ver estatísticas de todos', async () => {
      const res = await request(app.getHttpServer()).get('/nugecid/dashboard').set('Authorization', `Bearer ${adminToken}`).expect(200);
      expect(res.body.total).toBe(3);
      expect(res.body.pendentes).toBe(1);
      expect(res.body.emAndamento).toBe(1);
      expect(res.body.concluidos).toBe(1);
    });

    it('editor deve ver apenas suas estatísticas', async () => {
      const res = await request(app.getHttpServer()).get('/nugecid/dashboard').set('Authorization', `Bearer ${editorToken}`).expect(200);
      expect(res.body.total).toBe(2);
      expect(res.body.emAndamento).toBe(1);
      expect(res.body.concluidos).toBe(1);
    });
  });

  describe('Soft Delete and ACL', () => {
    let record: Desarquivamento;
    beforeEach(async () => {
      record = await desarquivamentoRepository.save(
        desarquivamentoRepository.create({ tipoSolicitacao: TipoSolicitacaoEnum.COPIA, nomeSolicitante: 'ACL Test', criadoPor: editorUser })
      );
      await request(app.getHttpServer()).delete(`/nugecid/${record.id}`).set('Authorization', `Bearer ${editorToken}`).expect(200);
    });

    it('registros deletados não devem aparecer em listagens normais', async () => {
      const res = await request(app.getHttpServer()).get('/nugecid').set('Authorization', `Bearer ${adminToken}`).expect(200);
      expect(res.body.desarquivamentos).toHaveLength(0);
    });

    it('deve incluir registros deletados quando solicitado', async () => {
      const res = await request(app.getHttpServer()).get('/nugecid?incluirExcluidos=true').set('Authorization', `Bearer ${adminToken}`).expect(200);
      expect(res.body.desarquivamentos).toHaveLength(1);
      expect(res.body.desarquivamentos[0].id).toBe(record.id);
    });
  });
});