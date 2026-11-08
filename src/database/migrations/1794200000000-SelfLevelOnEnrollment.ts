import { MigrationInterface, QueryRunner } from 'typeorm';

// O nível deixa de dividir as turmas e vira autoavaliação do atleta
// na matrícula (informativo para o professor).
// Matrículas existentes ficam sem nível ("não informado"): o nível da
// turma não era uma autoavaliação, então não é copiado.
export class SelfLevelOnEnrollment1794200000000 implements MigrationInterface {
  name = 'SelfLevelOnEnrollment1794200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`enrollment\` ADD \`selfLevel\` varchar(20) NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`training\` DROP COLUMN \`level\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`training\` ADD \`level\` varchar(20) NOT NULL DEFAULT 'iniciante'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`enrollment\` DROP COLUMN \`selfLevel\``,
    );
  }
}
