# Documento de Requisitos do Produto (PRD): Sistema Integrado de Gestão Documental (SGC-ITEP)
**Versão:** 1.0

**Data:** 26 de agosto de 2025

**Status:** Em Desenvolvimento 

**Autor:** Kevin Patrick Borges 

---

### **1. Introdução e Objetivo**

#### **1.1. Visão Geral**
O SGC-ITEP v2.0 é a evolução de uma plataforma web modular, projetada para modernizar, automatizar e escalar a gestão de fluxos documentais no ITEP-RN, utilizando uma arquitetura de microsserviços e um processo de desenvolvimento orquestrado.

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

**2.2. Usuário/Editor**
- **Descrição:** Funcionário do setor NUGECID que realiza as operações diárias de desarquivamento.
- **Permissões:** Acesso restrito para criar novos registros de desarquivamento e gerenciar (visualizar, editar, excluir) apenas os registros que ele próprio criou. A visualização de outros registros é bloqueada.

---

### **3. Escopo e Arquitetura Alvo**

#### **3.1. Funcionalidades Inclusas no Escopo (Módulo NUGECID v2.0)**
- Autenticação segura de usuários.
- Dashboard com informações rápidas e úteis.
- CRUD completo para registros de desarquivamento.
- Sistema de busca e filtragem avançada.
- Funcionalidade de importação de dados via planilha XLSX.
- Geração de Termo de Desarquivamento em formato PDF.
- Gestão de usuários (funcionalidade exclusiva do Administrador).
- Log de auditoria para ações críticas.

#### **3.2. Estratégia de Migração (Strangler Fig Pattern)**
A transição da v1 (Express/EJS) para a v2 (NestJS/React) será feita de forma incremental. A aplicação v1 atuará como um gateway, enquanto novos módulos e funcionalidades serão construídos na nova arquitetura, substituindo gradualmente o sistema legado sem tempo de inatividade.

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
- **Diretrizes para os Agentes de IA:**


#### **ÉPICO 2: Gestão de Registros de Desarquivamento (CRUD)**
- **História (RF-02):** Como um Usuário, eu quero poder criar, visualizar, editar e excluir registros de desarquivamento para manter o controle do fluxo de documentos.
- **Critérios de Aceite (AC):**
    - O formulário de criação deve conter todos os campos necessários (solicitante, número do prontuário, motivo, etc.).
    - A lista principal deve exibir todos os registros relevantes com paginação.
    - Usuários do tipo "Editor" só podem ver e gerenciar seus próprios registros.
    - O Administrador pode ver e gerenciar todos os registros.
    - A exclusão deve ser do tipo "soft delete".
- **Diretrizes para os Agentes de IA:**
*(Outros épicos como RF-03, RF-04 e RF-05 seguirão esta mesma estrutura)*

---

### **5. Requisitos Não-Funcionais**

- **5.1. Segurança:** O back-end DEVE usar `helmet`, proteção contra CSRF, e o `class-validator` do NestJS para todas as DTOs. Todas as senhas DEVEM ser hasheadas com `bcrypt`. O controle de acesso (ACL) deve ser implementado via `Guards` do NestJS.
- **5.2. Desempenho:** As consultas ao banco de dados DEVEM ser otimizadas. O padrão de paginação deve ser implementado em todas as listagens de API. O cache com **Redis** deve ser considerado para dados acessados frequentemente.
- **5.3. Usabilidade:** A interface deve ser intuitiva, responsiva e seguir um Design System consistente.

#### **7.2. Fluxo de Trabalho Mandatório (Backend)**
Toda tarefa delegada ao Agente Back-end DEVE seguir o seguinte fluxo de 5 fases, sem exceção:
1.  **Análise e Esclarecimento:** O agente analisa o requisito e faz perguntas se houver ambiguidade.
2.  **Plano de Implementação:** O agente apresenta um plano detalhado (contrato de API, alterações no schema, componentes a serem criados, estratégia de testes) e **aguarda aprovação humana**.
3.  **Geração de Código e Testes:** Após a aprovação, o agente gera o código da funcionalidade e os testes correspondentes.
4.  **Documentação:** O agente atualiza ou gera a documentação da API (OpenAPI/Swagger).
5.  **Análise de Segurança e Performance:** O agente preenche um checklist de revisão final.

---

### **8. Roadmap Futuro**

Após a estabilização da Versão 2.0 do módulo NUGECID, o desenvolvimento se concentrará em:
- **Bot de Automação do SEI-RN:** Desenvolver o serviço de monitoramento e extração de dados.
- **Módulo de Custódia de Vestígios:** Refinar e integrar completamente o módulo.
- **Novos Módulos:** Iniciar o planejamento para outros setores (Balística, DNA, etc.).
- **Sistema de Notificações:** Implementar alertas por e-mail para ações críticas ou prazos.