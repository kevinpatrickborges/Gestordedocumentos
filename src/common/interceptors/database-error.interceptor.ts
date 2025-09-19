import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { QueryFailedError } from 'typeorm';

export interface DatabaseErrorDetails {
  type: 'connection' | 'query' | 'constraint' | 'timeout' | 'unknown';
  code?: string;
  message: string;
  query?: string;
  parameters?: any[];
  constraint?: string;
  table?: string;
  column?: string;
  timestamp: Date;
  context: string;
}

@Injectable()
export class DatabaseErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(DatabaseErrorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const contextInfo = this.getContextInfo(context);

    return next.handle().pipe(
      tap(() => {
        // Log successful database operations in debug mode
        this.logger.debug(
          `🟢 [DB_SUCCESS] ${contextInfo.controller}.${contextInfo.handler} - Operação bem-sucedida`,
        );
      }),
      catchError(error => {
        const dbError = this.analyzeDatabaseError(error, contextInfo);

        if (dbError) {
          this.logDatabaseError(dbError, request);
          // Enhance the error with additional context
          error.databaseDetails = dbError;
        }

        return throwError(() => error);
      }),
    );
  }

  private getContextInfo(context: ExecutionContext) {
    return {
      controller: context.getClass().name,
      handler: context.getHandler().name,
      type: context.getType(),
    };
  }

  private analyzeDatabaseError(
    error: any,
    context: any,
  ): DatabaseErrorDetails | null {
    if (!this.isDatabaseError(error)) {
      return null;
    }

    const timestamp = new Date();
    const contextStr = `${context.controller}.${context.handler}`;

    // PostgreSQL Query Failed Error
    if (error instanceof QueryFailedError) {
      return this.analyzeQueryFailedError(error, contextStr, timestamp);
    }

    // Connection errors
    if (this.isConnectionError(error)) {
      return {
        type: 'connection',
        code: error.code,
        message: error.message,
        timestamp,
        context: contextStr,
      };
    }

    // Timeout errors
    if (this.isTimeoutError(error)) {
      return {
        type: 'timeout',
        code: error.code,
        message: error.message,
        timestamp,
        context: contextStr,
      };
    }

    // Generic database error
    return {
      type: 'unknown',
      code: error.code,
      message: error.message,
      timestamp,
      context: contextStr,
    };
  }

  private analyzeQueryFailedError(
    error: QueryFailedError,
    context: string,
    timestamp: Date,
  ): DatabaseErrorDetails {
    const pgError = error.driverError as any;

    let type: DatabaseErrorDetails['type'] = 'query';
    let constraint: string | undefined;
    let table: string | undefined;
    let column: string | undefined;

    // Analyze PostgreSQL error codes
    if (pgError.code) {
      switch (pgError.code) {
        case '23505': // unique_violation
          type = 'constraint';
          constraint = pgError.constraint;
          table = pgError.table;
          break;
        case '23503': // foreign_key_violation
          type = 'constraint';
          constraint = pgError.constraint;
          table = pgError.table;
          break;
        case '23502': // not_null_violation
          type = 'constraint';
          column = pgError.column;
          table = pgError.table;
          break;
        case '42P01': // undefined_table
          type = 'query';
          break;
        case '42703': // undefined_column
          type = 'query';
          break;
        case '08000': // connection_exception
        case '08003': // connection_does_not_exist
        case '08006': // connection_failure
          type = 'connection';
          break;
      }
    }

    return {
      type,
      code: pgError.code,
      message: error.message,
      query: error.query,
      parameters: error.parameters,
      constraint,
      table,
      column,
      timestamp,
      context,
    };
  }

  private isDatabaseError(error: any): boolean {
    return (
      error instanceof QueryFailedError ||
      this.isConnectionError(error) ||
      this.isTimeoutError(error) ||
      (error.code && this.isDatabaseErrorCode(error.code))
    );
  }

  private isConnectionError(error: any): boolean {
    return (
      error.code &&
      (error.code.startsWith('08') || // Connection errors
        error.code === 'ECONNREFUSED' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ETIMEDOUT' ||
        error.message?.includes('connection') ||
        error.message?.includes('connect'))
    );
  }

  private isTimeoutError(error: any): boolean {
    return (
      error.code === 'ETIMEDOUT' ||
      error.message?.includes('timeout') ||
      error.message?.includes('timed out')
    );
  }

  private isDatabaseErrorCode(code: string): boolean {
    // PostgreSQL error codes start with digits
    return (
      /^\d{5}$/.test(code) ||
      ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT'].includes(code)
    );
  }

  private logDatabaseError(error: DatabaseErrorDetails, request: any) {
    const {
      type,
      code,
      message,
      query,
      parameters,
      constraint,
      table,
      column,
      context,
    } = error;

    this.logger.error(`🔴 [DB_ERROR] Erro de banco de dados detectado:`);
    this.logger.error(`   📍 Contexto: ${context}`);
    this.logger.error(`   🔢 Tipo: ${type.toUpperCase()}`);
    this.logger.error(`   📊 Código: ${code || 'N/A'}`);
    this.logger.error(`   📝 Mensagem: ${message}`);

    if (query) {
      this.logger.error(`   🔍 Query: ${query}`);
    }

    if (parameters && parameters.length > 0) {
      this.logger.error(`   📋 Parâmetros: ${JSON.stringify(parameters)}`);
    }

    if (table) {
      this.logger.error(`   🏷️  Tabela: ${table}`);
    }

    if (column) {
      this.logger.error(`   📝 Coluna: ${column}`);
    }

    if (constraint) {
      this.logger.error(`   🔐 Constraint: ${constraint}`);
    }

    // Request context
    if (request) {
      this.logger.error(`   🌐 Método: ${request.method} ${request.url}`);
      this.logger.error(`   👤 User ID: ${request.user?.id || 'N/A'}`);
      this.logger.error(`   📧 User: ${request.user?.usuario || 'N/A'}`);
    }

    // Detailed analysis and suggestions
    this.provideDiagnosticSuggestions(error);
  }

  private provideDiagnosticSuggestions(error: DatabaseErrorDetails) {
    const { type, code, message } = error;

    this.logger.error(`🔧 [DB_DIAGNOSTIC] Sugestões de diagnóstico:`);

    switch (type) {
      case 'connection':
        this.logger.error(`   💡 Verificar se o PostgreSQL está rodando`);
        this.logger.error(`   💡 Verificar configurações de HOST/PORT no .env`);
        this.logger.error(`   💡 Verificar credenciais de usuário/senha`);
        this.logger.error(`   💡 Verificar regras de firewall`);
        break;

      case 'constraint':
        if (code === '23505') {
          this.logger.error(`   💡 Violação de unicidade - registro duplicado`);
          this.logger.error(
            `   💡 Verificar se o registro já existe antes de inserir`,
          );
        } else if (code === '23503') {
          this.logger.error(`   💡 Violação de chave estrangeira`);
          this.logger.error(
            `   💡 Verificar se o registro referenciado existe`,
          );
        } else if (code === '23502') {
          this.logger.error(`   💡 Campo obrigatório não preenchido`);
          this.logger.error(`   💡 Verificar validação dos dados de entrada`);
        }
        break;

      case 'query':
        if (code === '42P01') {
          this.logger.error(
            `   💡 Tabela não encontrada - verificar migrations`,
          );
        } else if (code === '42703') {
          this.logger.error(`   💡 Coluna não encontrada - verificar schema`);
        }
        break;

      case 'timeout':
        this.logger.error(`   💡 Query demorou muito para executar`);
        this.logger.error(`   💡 Verificar índices nas tabelas`);
        this.logger.error(`   💡 Considerar otimização da query`);
        break;

      default:
        this.logger.error(`   💡 Verificar logs detalhados do PostgreSQL`);
        this.logger.error(`   💡 Verificar conectividade com o banco`);
    }

    // General suggestions
    this.logger.error(`🔧 [DB_DIAGNOSTIC] Verificações gerais:`);
    this.logger.error(`   🔍 Endpoint de health: GET /api/health/database`);
    this.logger.error(`   🧪 Teste de queries: GET /api/health/database/test`);
    this.logger.error(`   📊 Info do banco: GET /api/health/database/info`);
  }
}
