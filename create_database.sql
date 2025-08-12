-- Script para criar o banco de dados SGC-ITEP no PostgreSQL local
-- Execute este script no pgAdmin ou psql

-- 1. Criar o banco de dados
CREATE DATABASE sgc_itep
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Portuguese_Brazil.1252'
    LC_CTYPE = 'Portuguese_Brazil.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- 2. Comentário do banco
COMMENT ON DATABASE sgc_itep IS 'Sistema de Gestão de Conteúdo - ITEP/RN';

-- 3. Conectar ao banco sgc_itep para criar as tabelas
\c sgc_itep;

-- 4. Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";