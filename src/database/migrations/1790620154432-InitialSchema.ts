import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1790620154432 implements MigrationInterface {
  name = 'InitialSchema1790620154432';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`training\` (\`id\` int NOT NULL AUTO_INCREMENT, \`modality\` varchar(255) NOT NULL, \`hour\` varchar(255) NOT NULL, \`address\` varchar(255) NOT NULL, \`weekdays\` text NOT NULL, \`description\` varchar(255) NULL, \`active\` tinyint NOT NULL DEFAULT 1, \`maxStudents\` int NOT NULL, \`minStudents\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`professorId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`enrollment\` (\`id\` int NOT NULL AUTO_INCREMENT, \`date\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`active\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` int NULL, \`trainingId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`tournament_bracket\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`type\` enum ('single', 'double', 'round-robin') NOT NULL, \`teamCount\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`event_registration\` (\`id\` int NOT NULL AUTO_INCREMENT, \`active\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` int NULL, \`eventId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`event\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`image\` varchar(255) NULL, \`date\` datetime NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` int NULL, \`tournamentBracketId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`userType\` varchar(255) NOT NULL, \`telephone\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`survey_response\` (\`id\` int NOT NULL AUTO_INCREMENT, \`rating\` int NOT NULL, \`comment\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`trainingId\` int NULL, \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`strava\` (\`id\` int NOT NULL AUTO_INCREMENT, \`stravaId\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`distance\` float NOT NULL, \`movingTime\` int NOT NULL, \`elapsedTime\` int NOT NULL, \`totalElevationGain\` float NOT NULL, \`type\` varchar(255) NOT NULL, \`sportType\` varchar(255) NULL, \`averageSpeed\` float NULL, \`maxSpeed\` float NULL, \`startDate\` timestamp NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_cb9b23c0ee003481eecfface8b\` (\`stravaId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`training\` ADD CONSTRAINT \`FK_ddd1dfe21c8a53617d1dd658695\` FOREIGN KEY (\`professorId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`enrollment\` ADD CONSTRAINT \`FK_e97ecbf11356b5173ce7fb0b060\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`enrollment\` ADD CONSTRAINT \`FK_4d70bf1ca9b81baaa1e3a41fd9b\` FOREIGN KEY (\`trainingId\`) REFERENCES \`training\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_registration\` ADD CONSTRAINT \`FK_a4d960e4a113017e7e6b15f14b9\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_registration\` ADD CONSTRAINT \`FK_ebd16a55e8ad05fdb6cf0b325af\` FOREIGN KEY (\`eventId\`) REFERENCES \`event\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event\` ADD CONSTRAINT \`FK_01cd2b829e0263917bf570cb672\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`event\` ADD CONSTRAINT \`FK_410754948302d17f40442f89559\` FOREIGN KEY (\`tournamentBracketId\`) REFERENCES \`tournament_bracket\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`survey_response\` ADD CONSTRAINT \`FK_907a53cb6578d65a73efc905c5b\` FOREIGN KEY (\`trainingId\`) REFERENCES \`training\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`survey_response\` ADD CONSTRAINT \`FK_6f270d46c6b0e0b68373a417c5a\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`survey_response\` DROP FOREIGN KEY \`FK_6f270d46c6b0e0b68373a417c5a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`survey_response\` DROP FOREIGN KEY \`FK_907a53cb6578d65a73efc905c5b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event\` DROP FOREIGN KEY \`FK_410754948302d17f40442f89559\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event\` DROP FOREIGN KEY \`FK_01cd2b829e0263917bf570cb672\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_registration\` DROP FOREIGN KEY \`FK_ebd16a55e8ad05fdb6cf0b325af\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`event_registration\` DROP FOREIGN KEY \`FK_a4d960e4a113017e7e6b15f14b9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`enrollment\` DROP FOREIGN KEY \`FK_4d70bf1ca9b81baaa1e3a41fd9b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`enrollment\` DROP FOREIGN KEY \`FK_e97ecbf11356b5173ce7fb0b060\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`training\` DROP FOREIGN KEY \`FK_ddd1dfe21c8a53617d1dd658695\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_cb9b23c0ee003481eecfface8b\` ON \`strava\``,
    );
    await queryRunner.query(`DROP TABLE \`strava\``);
    await queryRunner.query(`DROP TABLE \`survey_response\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``,
    );
    await queryRunner.query(`DROP TABLE \`user\``);
    await queryRunner.query(`DROP TABLE \`event\``);
    await queryRunner.query(`DROP TABLE \`event_registration\``);
    await queryRunner.query(`DROP TABLE \`tournament_bracket\``);
    await queryRunner.query(`DROP TABLE \`enrollment\``);
    await queryRunner.query(`DROP TABLE \`training\``);
  }
}
