import { MigrationInterface, QueryRunner } from 'typeorm';
import { normalizeKey } from '../../training/training-conflicts';

// Travas de agenda dos treinos:
// - duração do treino (para detectar choque de local e de professor);
// - unifica grafias da mesma modalidade ("judo" e "Judô" → uma só).
export class TrainingConflictRules1794175508360 implements MigrationInterface {
  name = 'TrainingConflictRules1794175508360';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`training\` ADD \`durationMinutes\` int NOT NULL DEFAULT '90'`,
    );

    const raw: { raw: Buffer | string; total: string | number }[] =
      await queryRunner.query(
        // BINARY: a collation padrão do MySQL ignora acento e caixa
        // e juntaria "judo" e "Judô" em um grupo só.
        'SELECT CAST(`modality` AS BINARY) AS `raw`, COUNT(*) AS `total` FROM `training` GROUP BY CAST(`modality` AS BINARY)',
      );
    const rows = raw.map((r) => ({
      modality: Buffer.isBuffer(r.raw) ? r.raw.toString('utf8') : r.raw,
      total: r.total,
    }));
    const groups = new Map<string, { modality: string; total: number }[]>();
    for (const r of rows) {
      const key = normalizeKey(r.modality);
      groups.set(key, [
        ...(groups.get(key) ?? []),
        { modality: r.modality, total: Number(r.total) },
      ]);
    }
    for (const spellings of groups.values()) {
      if (spellings.length < 2) continue;
      // Mais usada; no empate, a que tem acento ou maiúscula.
      const formatted = (m: string) => (m !== normalizeKey(m) ? 1 : 0);
      spellings.sort(
        (a, b) =>
          b.total - a.total || formatted(b.modality) - formatted(a.modality),
      );
      const canonical = spellings[0].modality;
      for (const { modality } of spellings.slice(1)) {
        await queryRunner.query(
          'UPDATE `training` SET `modality` = ? WHERE CAST(`modality` AS BINARY) = CAST(? AS BINARY)',
          [canonical, modality],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // A unificação das grafias não é desfeita.
    await queryRunner.query(
      `ALTER TABLE \`training\` DROP COLUMN \`durationMinutes\``,
    );
  }
}
