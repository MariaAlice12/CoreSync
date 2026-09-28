import { MigrationInterface, QueryRunner } from "typeorm";

export class CascadeTrainingDelete1790621675753 implements MigrationInterface {
    name = 'CascadeTrainingDelete1790621675753'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`enrollment\` DROP FOREIGN KEY \`FK_4d70bf1ca9b81baaa1e3a41fd9b\``);
        await queryRunner.query(`ALTER TABLE \`survey_response\` DROP FOREIGN KEY \`FK_907a53cb6578d65a73efc905c5b\``);
        await queryRunner.query(`ALTER TABLE \`enrollment\` ADD CONSTRAINT \`FK_4d70bf1ca9b81baaa1e3a41fd9b\` FOREIGN KEY (\`trainingId\`) REFERENCES \`training\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`survey_response\` ADD CONSTRAINT \`FK_907a53cb6578d65a73efc905c5b\` FOREIGN KEY (\`trainingId\`) REFERENCES \`training\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`survey_response\` DROP FOREIGN KEY \`FK_907a53cb6578d65a73efc905c5b\``);
        await queryRunner.query(`ALTER TABLE \`enrollment\` DROP FOREIGN KEY \`FK_4d70bf1ca9b81baaa1e3a41fd9b\``);
        await queryRunner.query(`ALTER TABLE \`survey_response\` ADD CONSTRAINT \`FK_907a53cb6578d65a73efc905c5b\` FOREIGN KEY (\`trainingId\`) REFERENCES \`training\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`enrollment\` ADD CONSTRAINT \`FK_4d70bf1ca9b81baaa1e3a41fd9b\` FOREIGN KEY (\`trainingId\`) REFERENCES \`training\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
