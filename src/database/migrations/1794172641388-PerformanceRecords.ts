import { MigrationInterface, QueryRunner } from 'typeorm';

// Registro de desempenho do atleta por sessão de treino (professor).

export class PerformanceRecords1794172641388 implements MigrationInterface {
  name = 'PerformanceRecords1794172641388';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`performance_record\` (\`id\` int NOT NULL AUTO_INCREMENT, \`rating\` int NULL, \`notes\` text NULL, \`metrics\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`attendanceId\` int NULL, \`recordedById\` int NULL, UNIQUE INDEX \`REL_e1c31b53cccd3935b370a6c94d\` (\`attendanceId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`performance_record\` ADD CONSTRAINT \`FK_e1c31b53cccd3935b370a6c94d4\` FOREIGN KEY (\`attendanceId\`) REFERENCES \`attendance\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`performance_record\` ADD CONSTRAINT \`FK_9fe61cede29cce0b58579c0a5b8\` FOREIGN KEY (\`recordedById\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`performance_record\` DROP FOREIGN KEY \`FK_9fe61cede29cce0b58579c0a5b8\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`performance_record\` DROP FOREIGN KEY \`FK_e1c31b53cccd3935b370a6c94d4\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_e1c31b53cccd3935b370a6c94d\` ON \`performance_record\``,
    );
    await queryRunner.query(`DROP TABLE \`performance_record\``);
  }
}
