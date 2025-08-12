# Testes do Módulo NUGECID - SGC-ITEP v2.0

Este diretório contém a suíte completa de testes para o módulo NUGECID (Núcleo de Gestão de Conteúdo e Informação Digital), implementando o **Épico 2: Gestão de Registros de Desarquivamento**.

## 📋 Estrutura dos Testes

### Testes Unitários
- **`nugecid.service.spec.ts`** - Testes unitários para `NugecidService`
- **`nugecid.controller.spec.ts`** - Testes unitários para `NugecidController`

### Testes de Integração
- **`nugecid-integration.spec.ts`** - Testes end-to-end dos endpoints da API
- **`acl-validation.spec.ts`** - Validação completa das regras de ACL (Access Control List)

### Arquivos de Suporte
- **`test-setup.ts`** - Configurações, helpers e mocks para testes
- **`README.md`** - Esta documentação

## 🎯 Cobertura de Testes

### Funcionalidades Testadas

#### ✅ CRUD Operations
- [x] Criação de registros de desarquivamento
- [x] Listagem com paginação e filtros
- [x] Busca por ID e código de barras
- [x] Atualização de registros
- [x] Soft delete (exclusão lógica)

#### ✅ Autenticação e Autorização
- [x] Validação de tokens JWT
- [x] Proteção de endpoints com guards
- [x] Verificação de roles (admin, editor, user)
- [x] Regras de ACL por usuário e status

#### ✅ Regras de Negócio
- [x] Geração automática de código de barras
- [x] Validação de dados de entrada (DTOs)
- [x] Transições de status
- [x] Verificação de prazos (registros vencidos)
- [x] Auditoria de ações

#### ✅ Funcionalidades Avançadas
- [x] Dashboard com estatísticas
- [x] Exportação para Excel
- [x] Importação de Excel
- [x] Filtros avançados de busca

### Cenários de ACL Testados

#### 👑 Administrador
- ✅ Acesso total a todos os registros
- ✅ Edição de registros em qualquer status
- ✅ Exclusão de registros em qualquer status
- ✅ Visualização de estatísticas globais

#### ✏️ Editor
- ✅ Acesso apenas aos próprios registros
- ✅ Edição limitada por status do registro
- ✅ Exclusão limitada por status do registro
- ✅ Estatísticas apenas dos próprios registros

#### 👤 Usuário Regular
- ✅ Sem acesso a registros de desarquivamento
- ✅ Apenas consulta pública por código de barras

## 🚀 Como Executar os Testes

### Pré-requisitos
```bash
# Instalar dependências
npm install

# Instalar dependências de desenvolvimento
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

### Comandos de Execução

#### Todos os Testes
```bash
npm test
```

#### Apenas Testes Unitários
```bash
npm test -- --testPathPattern="src/.*\.spec\.ts$"
```

#### Apenas Testes de Integração
```bash
npm test -- --testPathPattern="test/.*\.spec\.ts$"
```

#### Testes com Cobertura
```bash
npm test -- --coverage
```

#### Testes em Modo Watch
```bash
npm test -- --watch
```

#### Testes Específicos
```bash
# Apenas testes do service
npm test nugecid.service.spec.ts

# Apenas testes do controller
npm test nugecid.controller.spec.ts

# Apenas testes de integração
npm test nugecid-integration.spec.ts

# Apenas validação de ACL
npm test acl-validation.spec.ts
```

## 📊 Métricas de Qualidade

### Cobertura de Código
- **Meta Global:** 80% (branches, functions, lines, statements)
- **Meta Módulo NUGECID:** 90% (branches, functions, lines, statements)

### Relatórios de Cobertura
Após executar os testes com `--coverage`, os relatórios estarão disponíveis em:
- **HTML:** `./coverage/lcov-report/index.html`
- **LCOV:** `./coverage/lcov.info`
- **Console:** Exibido automaticamente

## 🧪 Estrutura dos Testes

### Padrões Utilizados

#### Arrange-Act-Assert (AAA)
```typescript
// Arrange - Preparar dados de teste
const createDto = { /* dados */ };
const mockUser = TestMocks.createMockUser();

// Act - Executar ação
const result = await service.create(createDto, mockUser);

// Assert - Verificar resultado
expect(result).toBeDefined();
expect(result.nomeRequerente).toBe(createDto.nomeRequerente);
```

#### Mocks e Stubs
```typescript
// Mock de repositório
const mockRepository = TestMocks.createMockRepository();
mockRepository.save.mockResolvedValue(expectedResult);

// Mock de usuário
const mockUser = TestMocks.createMockUser({ role: 'admin' });
```

#### Testes Parametrizados
```typescript
describe.each([
  ['admin', true],
  ['editor', false],
  ['user', false],
])('Role %s permissions', (role, canAccess) => {
  it(`should ${canAccess ? 'allow' : 'deny'} access`, () => {
    // teste
  });
});
```

## 🔧 Configuração do Ambiente de Teste

### Banco de Dados
- **Tipo:** SQLite em memória (`:memory:`)
- **Sincronização:** Automática (`synchronize: true`)
- **Limpeza:** Automática entre testes

### Autenticação
- **JWT Secret:** `test-secret-key-for-nugecid-tests`
- **Expiração:** 1 hora
- **Algoritmo:** HS256

### Usuários de Teste
- **Admin:** `admin.test@itep.rn.gov.br` / `admin123!@#`
- **Editor:** `editor.test@itep.rn.gov.br` / `editor123!@#`
- **User:** `user.test@itep.rn.gov.br` / `user123!@#`

## 🐛 Debugging

### Logs de Teste
```bash
# Executar com logs detalhados
npm test -- --verbose

# Executar teste específico com debug
npm test -- --testNamePattern="deve criar desarquivamento" --verbose
```

### Variáveis de Ambiente
```bash
# Habilitar logs do TypeORM
TYPEORM_LOGGING=true npm test

# Aumentar timeout dos testes
JEST_TIMEOUT=60000 npm test
```

## 📝 Convenções de Nomenclatura

### Arquivos de Teste
- **Unitários:** `*.spec.ts` (dentro de `src/`)
- **Integração:** `*-integration.spec.ts` (dentro de `test/`)
- **Validação:** `*-validation.spec.ts` (dentro de `test/`)

### Descrições de Teste
```typescript
// ✅ Bom
describe('NugecidService', () => {
  describe('create', () => {
    it('deve criar desarquivamento com dados válidos', () => {});
    it('deve rejeitar dados inválidos', () => {});
  });
});

// ❌ Evitar
describe('Test', () => {
  it('should work', () => {});
});
```

## 🔍 Validação de ACL

Os testes de ACL validam os seguintes cenários:

### Acesso por Role
- **Admin:** Acesso total
- **Editor:** Acesso limitado aos próprios registros
- **User:** Sem acesso (exceto consulta pública)

### Acesso por Status
- **PENDENTE:** Editável pelo criador
- **EM_ANDAMENTO:** Editável, não deletável pelo criador
- **CONCLUIDO:** Somente leitura (exceto admin)
- **CANCELADO:** Somente leitura (exceto admin)

### Acesso por Estado do Usuário
- **Ativo:** Acesso normal
- **Inativo:** Sem acesso
- **Bloqueado:** Sem acesso

## 📈 Monitoramento de Performance

### Timeouts
- **Teste Individual:** 30 segundos
- **Suite Completa:** Sem limite
- **Setup/Teardown:** 10 segundos

### Otimizações
- **Workers:** 1 (para evitar conflitos de DB)
- **Cache:** Habilitado
- **Paralelização:** Desabilitada para testes de integração

## 🚨 Troubleshooting

### Problemas Comuns

#### Erro de Timeout
```bash
# Aumentar timeout
npm test -- --testTimeout=60000
```

#### Erro de Conexão com DB
```bash
# Limpar cache do Jest
npm test -- --clearCache
```

#### Erro de Importação
```bash
# Verificar paths no jest.config.js
# Verificar se todos os módulos estão instalados
npm install
```

### Logs Úteis
```typescript
// Habilitar logs em testes específicos
console.log('Debug info:', { user, record, permissions });

// Usar apenas durante desenvolvimento
if (process.env.NODE_ENV === 'test') {
  console.log('Test debug info');
}
```

## 📚 Referências

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [TypeORM Testing](https://typeorm.io/testing)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

---

**Desenvolvido para SGC-ITEP v2.0 - Épico 2: Gestão de Registros de Desarquivamento**

*Última atualização: Dezembro 2024*