import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRolesTable1700000001000 implements MigrationInterface {
  name = 'CreateRolesTable1700000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar tabela roles
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(100) UNIQUE NOT NULL,
        "description" text,
        "permissions" jsonb DEFAULT '{}',
        "ativo" boolean DEFAULT true NOT NULL,
        "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    // Criar índices
    await queryRunner.query(`
      CREATE INDEX "IDX_ROLES_NAME" ON "roles" ("name")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_ROLES_ATIVO" ON "roles" ("ativo")
    `);

    // Inserir roles padrão
    await queryRunner.query(`
      INSERT INTO "roles" ("name", "description", "permissions", "ativo") VALUES 
      ('admin', 'Administrador do sistema', '{"all": true}', true),
      ('user', 'Usuário padrão', '{"read": true, "create": true}', true),
      ('viewer', 'Visualizador', '{"read": true}', true)
      ON CONFLICT ("name") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}