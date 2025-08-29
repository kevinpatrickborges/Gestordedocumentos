# Documento de Requisitos do Produto (PRD): Sistema Integrado de Gestão Documental (SGC-ITEP)
**Versão:** 1.0

**Data:** 27 de agosto de 2025

**Status:** Em Desenvolvimento 

**Autor:** Kevin Patrick Borges 

---

### **1. Introdução e Objetivo**

#### **1.1. Visão Geral**
O SGC-ITEP v1.0 é uma plataforma web modular, projetada para modernizar, automatizar e escalar a gestão de fluxos documentais no ITEP-RN, utilizando uma arquitetura de microsserviços e um processo de desenvolvimento orquestrado.

#### **1.2. Problema**
Atualmente, o controle de processos de desarquivamento de documentos no setor NUGECID é realizado de forma manual através de planilhas. Este método é suscetível a erros, demorado, dificulta a rastreabilidade (auditoria) e não oferece um controle de acesso seguro às informações.

#### **1.3. Objetivo**
O objetivo do SGC-ITEP é substituir o processo manual por um sistema digital centralizado que:
- Aumente a eficiência operacional, automatizando o registro e a busca.
- Garanta a segurança da informação através de controle de acesso por níveis.
- Forneça uma trilha de auditoria completa para todas as ações.
- Seja a base para a digitalização de outros fluxos de trabalho no ITEP.
---

### **2. Personas e Papéis de Usuário**

O sistema terá dois níveis de acesso principais:

**2.1. Administrador**
- **Descrição:** Usuário com controle total sobre o sistema. Geralmente um gestor ou o responsável técnico.
- **Permissões:** Acesso a todas as funcionalidades, incluindo: criar, ler, editar e excluir todos os registros; gerenciar usuários e suas permissões; visualizar relatórios e estatísticas completas.

**2.2. Usuário**
- **Descrição:** Funcionário do setor NUGECID que realiza as operações diárias de desarquivamento.
- **Permissões:** Acesso restrito para criar novos registros de desarquivamento e gerenciar (visualizar, editar, excluir) apenas os registros que ele próprio criou. A visualização de outros registros é bloqueada.

---

### **3. Escopo e Arquitetura Alvo**

#### **3.1. Funcionalidades Inclusas no Escopo (Módulo NUGECID v1.0)**
- Autenticação segura de usuários.
- Dashboard com informações rápidas e úteis.
- CRUD completo para registros de desarquivamento.
- Sistema de busca e filtragem avançada.
- Funcionalidade de importação de dados via planilha XLSX.
- Geração de Termo de Desarquivamento em formato PDF.
- Gestão de usuários (funcionalidade exclusiva do Administrador).
- Log de auditoria para ações críticas.

#### **3.2. Arquitetura Atual**
O SGC-ITEP v1.0 utiliza uma arquitetura moderna com NestJS no backend e React no frontend, implementando uma solução completa e integrada para gestão documental.

#### **3.3. Arquitetura Alvo**
- **Back-end:** Arquitetura de microsserviços com **NestJS**. Cada domínio de negócio (ex: Autenticação, Gestão de Registros) será um módulo autocontido, seguindo os princípios da **Arquitetura Hexagonal (Portas e Adaptadores)** para garantir o desacoplamento.
- **Front-end:** Uma **Single Page Application (SPA)** desacoplada, que consome a API do back-end.
- **Comunicação:** API RESTful e, futuramente, mensageria (RabbitMQ) para comunicação assíncrona entre serviços.

---

### **4. Épicos e Histórias de Usuário**

Os requisitos funcionais serão organizados em Épicos. Cada requisito se torna uma diretriz para a equipe de agentes.

#### **ÉPICO 1: Autenticação e Gestão de Sessão**
- **História (RF-01):** Como um usuário cadastrado, eu quero poder fazer login de forma segura para acessar o sistema.
- **Critérios de Aceite (AC):**
    - A tela de login deve conter campos para "Usuário" e "Senha".
    - As senhas devem ser verificadas usando bcrypt no backend.
    - O sistema deve impedir o acesso a qualquer página interna sem autenticação.
    - O sistema deve ter uma função de "Logout".
- **Diretrizes para Agentes de IA:**
    - Implementar middleware de autenticação JWT com Guards do NestJS
    - Criar componentes React para formulário de login com validação
    - Configurar interceptadores para redirecionamento automático em caso de token expirado
    - Implementar hash de senhas com bcrypt e salt rounds >= 12
    - Criar contexto de autenticação no frontend para gerenciar estado do usuário


#### **ÉPICO 2: Gestão de Registros de Desarquivamento (CRUD)**
- **História (RF-02):** Como um Usuário, eu quero poder criar, visualizar, editar e excluir registros de desarquivamento para manter o controle do fluxo de documentos.
- **Critérios de Aceite (AC):**
    - O formulário de criação deve conter todos os campos necessários (solicitante, número do prontuário, motivo, etc.).
    - A lista principal deve exibir todos os registros relevantes com paginação.
    - Usuários só podem ver e gerenciar seus próprios registros.
    - O Administrador pode ver e gerenciar todos os registros.
    - A exclusão deve ser do tipo "soft delete".
- **Diretrizes para Agentes de IA:**
    - Implementar entidades TypeORM com soft delete (deletedAt)
    - Criar DTOs com class-validator para validação de entrada
    - Implementar Guards de autorização baseados em roles (RBAC)
    - Desenvolver componentes React com formulários controlados e validação
    - Implementar paginação server-side com query builders otimizados
    - Criar interceptadores de auditoria para log de ações CRUD

#### **ÉPICO 3: Importação e Exportação de Dados**
- **História (RF-03):** Como um Administrador, eu quero poder importar dados de planilhas XLSX e exportar relatórios para facilitar a migração e análise de dados.
- **Critérios de Aceite (AC):**
    - O sistema deve aceitar upload de arquivos XLSX com formato específico.
    - Deve validar os dados antes da importação e exibir erros se houver.
    - Deve permitir exportação de dados filtrados em formato PDF e XLSX.
    - O processo de importação deve ser auditado.
- **Diretrizes para Agentes de IA:**
    - Implementar upload de arquivos com multer e validação de tipo MIME
    - Usar bibliotecas como xlsx para parsing de planilhas
    - Criar validadores customizados para dados importados
    - Implementar geração de PDFs com bibliotecas como PDFKit
    - Criar componentes de drag-and-drop para upload de arquivos

#### **ÉPICO 4: Sistema de Busca e Filtragem**
- **História (RF-04):** Como um usuário, eu quero poder buscar e filtrar registros de forma eficiente para encontrar informações específicas rapidamente.
- **Critérios de Aceite (AC):**
    - Deve permitir busca por múltiplos campos simultaneamente.
    - Deve implementar filtros por data, status, solicitante, etc.
    - Os resultados devem ser paginados e ordenáveis.
    - A busca deve ser case-insensitive e suportar busca parcial.
- **Diretrizes para Agentes de IA:**
    - Implementar query builders dinâmicos com TypeORM
    - Criar componentes de filtro reutilizáveis no frontend
    - Implementar debounce para otimizar performance de busca
    - Usar índices de banco de dados para campos de busca frequente
    - Criar sistema de cache para consultas complexas

#### **ÉPICO 5: Dashboard e Relatórios**
- **História (RF-05):** Como um usuário, eu quero visualizar estatísticas e métricas do sistema em um dashboard intuitivo para acompanhar o desempenho operacional.
- **Critérios de Aceite (AC):**
    - Deve exibir gráficos de registros por período, status e usuário.
    - Deve mostrar métricas de performance e indicadores-chave.
    - Administradores devem ver dados de todos os usuários.
    - Usuários comuns devem ver apenas suas próprias estatísticas.
- **Diretrizes para Agentes de IA:**
    - Implementar queries agregadas otimizadas para estatísticas
    - Usar bibliotecas de gráficos como Chart.js ou Recharts
    - Criar componentes de dashboard responsivos e interativos
    - Implementar cache de estatísticas com TTL apropriado
    - Desenvolver sistema de métricas em tempo real

---

### **5. Requisitos Não-Funcionais**

- **5.1. Segurança:** O back-end DEVE usar `helmet`, proteção contra CSRF, e o `class-validator` do NestJS para todas as DTOs. Todas as senhas DEVEM ser hasheadas com `bcrypt`. O controle de acesso (ACL) deve ser implementado via `Guards` do NestJS.
- **5.2. Desempenho:** As consultas ao banco de dados DEVEM ser otimizadas. O padrão de paginação deve ser implementado em todas as listagens de API. O cache com **Redis** deve ser considerado para dados acessados frequentemente.
- **5.3. Usabilidade:** A interface deve ser intuitiva, responsiva e seguir um Design System consistente.

---

### **6. Arquitetura de Dados**

#### **6.1. Modelo de Dados Principal**
- **Entidade Desarquivamento:** Contém todos os campos necessários para o registro de desarquivamento, incluindo metadados de auditoria.
- **Entidade Usuário:** Gerencia informações de autenticação e autorização dos usuários do sistema.
- **Entidade Role:** Define os papéis e permissões no sistema (Administrador, Usuário).
- **Entidade AuditLog:** Registra todas as ações críticas realizadas no sistema para trilha de auditoria.

#### **6.2. Relacionamentos**
- Um usuário pode ter múltiplos registros de desarquivamento (1:N).
- Cada usuário possui uma role específica (N:1).
- Todas as ações são registradas no log de auditoria (1:N).

---

### **7. Considerações de Implementação**

#### **7.1. Tecnologias e Ferramentas**
- **Backend:** NestJS, TypeORM, PostgreSQL, JWT, bcrypt
- **Frontend:** React, TypeScript, Tailwind CSS, React Hook Form
- **Infraestrutura:** Docker, Redis (cache), Winston (logging)
- **Testes:** Jest, Supertest, React Testing Library
- **Documentação:** Swagger/OpenAPI, Compodoc

---

### **8. Roadmap Futuro**

Após a estabilização da Versão 2.0 do módulo NUGECID, o desenvolvimento se concentrará em:
- **Bot de Automação do SEI-RN:** Desenvolver o serviço de monitoramento e extração de dados.
- **Módulo de Custódia de Vestígios:** Refinar e integrar completamente o módulo.
- **Novos Módulos:** Iniciar o planejamento para outros setores (Balística, DNA, etc.).
- **Sistema de Notificações:** Implementar alertas por e-mail para ações críticas ou prazos.