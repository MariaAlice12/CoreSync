import { MigrationInterface, QueryRunner } from "typeorm";

// Requisitos da especificação do TCC:
// - user: curso, turno e campus (segmentação)
// - training: nível (iniciante/intermediário/avançado) e campus
// - event: local, organizadores e repositório de fotos
// - attendance: marcação de presença
// - notification: notificações automáticas
// - strava_account / strava: integração OAuth por atleta, FC e cadência
export class TccRequirements1790700000000 implements MigrationInterface {
    name = 'TccRequirements1790700000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`course\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`shift\` varchar(20) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`campus\` varchar(255) NULL`);

        await queryRunner.query(`ALTER TABLE \`training\` ADD \`level\` varchar(20) NOT NULL DEFAULT 'iniciante'`);
        await queryRunner.query(`ALTER TABLE \`training\` ADD \`campus\` varchar(255) NULL`);

        await queryRunner.query(`ALTER TABLE \`event\` ADD \`location\` varchar(255) NULL`);

        await queryRunner.query(`ALTER TABLE \`strava\` ADD \`averageHeartrate\` float NULL`);
        await queryRunner.query(`ALTER TABLE \`strava\` ADD \`maxHeartrate\` float NULL`);
        await queryRunner.query(`ALTER TABLE \`strava\` ADD \`averageCadence\` float NULL`);
        await queryRunner.query(`ALTER TABLE \`strava\` ADD \`userId\` int NULL`);

        await queryRunner.query(`CREATE TABLE \`event_organizers\` (\`eventId\` int NOT NULL, \`userId\` int NOT NULL, INDEX \`IDX_a6d8e5f08cb91adb8467729fae\` (\`eventId\`), INDEX \`IDX_c90f7b35af81b5d9c85129e41d\` (\`userId\`), PRIMARY KEY (\`eventId\`, \`userId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`event_photo\` (\`id\` int NOT NULL AUTO_INCREMENT, \`url\` varchar(512) NOT NULL, \`key\` varchar(512) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`eventId\` int NULL, \`uploadedById\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`attendance\` (\`id\` int NOT NULL AUTO_INCREMENT, \`date\` date NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` int NULL, \`trainingId\` int NULL, UNIQUE INDEX \`UQ_attendance_user_training_date\` (\`userId\`, \`trainingId\`, \`date\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`notification\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`message\` text NOT NULL, \`type\` varchar(40) NOT NULL, \`link\` varchar(255) NULL, \`read\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` int NULL, INDEX \`IDX_4504a5558a05961b081fdb5492\` (\`userId\`, \`read\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`strava_account\` (\`id\` int NOT NULL AUTO_INCREMENT, \`athleteId\` varchar(255) NOT NULL, \`athleteName\` varchar(255) NULL, \`accessToken\` varchar(255) NOT NULL, \`refreshToken\` varchar(255) NOT NULL, \`expiresAt\` int NOT NULL, \`scope\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` int NULL, UNIQUE INDEX \`REL_07a3ddf01665810c413f107656\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        // Excluir um evento passa a remover as inscrições dele.
        await queryRunner.query(`ALTER TABLE \`event_registration\` DROP FOREIGN KEY \`FK_ebd16a55e8ad05fdb6cf0b325af\``);
        await queryRunner.query(`ALTER TABLE \`event_registration\` ADD CONSTRAINT \`FK_ebd16a55e8ad05fdb6cf0b325af\` FOREIGN KEY (\`eventId\`) REFERENCES \`event\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);

        await queryRunner.query(`ALTER TABLE \`strava\` ADD CONSTRAINT \`FK_08b39283c9791c3d45f6bb77d40\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`event_organizers\` ADD CONSTRAINT \`FK_a6d8e5f08cb91adb8467729fae3\` FOREIGN KEY (\`eventId\`) REFERENCES \`event\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`event_organizers\` ADD CONSTRAINT \`FK_c90f7b35af81b5d9c85129e41d6\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`event_photo\` ADD CONSTRAINT \`FK_d1c397676a9d70dc7026ebf261b\` FOREIGN KEY (\`eventId\`) REFERENCES \`event\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`event_photo\` ADD CONSTRAINT \`FK_d1132b8362432cf667b1849ec51\` FOREIGN KEY (\`uploadedById\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`attendance\` ADD CONSTRAINT \`FK_466e85b813d871bfb693f443528\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`attendance\` ADD CONSTRAINT \`FK_6212758340f6b6e910f21803012\` FOREIGN KEY (\`trainingId\`) REFERENCES \`training\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notification\` ADD CONSTRAINT \`FK_1ced25315eb974b73391fb1c81b\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`strava_account\` ADD CONSTRAINT \`FK_07a3ddf01665810c413f107656e\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);

        // Eventos já existentes: o criador vira organizador.
        await queryRunner.query(`INSERT INTO \`event_organizers\` (\`eventId\`, \`userId\`) SELECT \`id\`, \`userId\` FROM \`event\` WHERE \`userId\` IS NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`strava_account\` DROP FOREIGN KEY \`FK_07a3ddf01665810c413f107656e\``);
        await queryRunner.query(`ALTER TABLE \`notification\` DROP FOREIGN KEY \`FK_1ced25315eb974b73391fb1c81b\``);
        await queryRunner.query(`ALTER TABLE \`attendance\` DROP FOREIGN KEY \`FK_6212758340f6b6e910f21803012\``);
        await queryRunner.query(`ALTER TABLE \`attendance\` DROP FOREIGN KEY \`FK_466e85b813d871bfb693f443528\``);
        await queryRunner.query(`ALTER TABLE \`event_photo\` DROP FOREIGN KEY \`FK_d1132b8362432cf667b1849ec51\``);
        await queryRunner.query(`ALTER TABLE \`event_photo\` DROP FOREIGN KEY \`FK_d1c397676a9d70dc7026ebf261b\``);
        await queryRunner.query(`ALTER TABLE \`event_organizers\` DROP FOREIGN KEY \`FK_c90f7b35af81b5d9c85129e41d6\``);
        await queryRunner.query(`ALTER TABLE \`event_organizers\` DROP FOREIGN KEY \`FK_a6d8e5f08cb91adb8467729fae3\``);
        await queryRunner.query(`ALTER TABLE \`strava\` DROP FOREIGN KEY \`FK_08b39283c9791c3d45f6bb77d40\``);

        await queryRunner.query(`ALTER TABLE \`event_registration\` DROP FOREIGN KEY \`FK_ebd16a55e8ad05fdb6cf0b325af\``);
        await queryRunner.query(`ALTER TABLE \`event_registration\` ADD CONSTRAINT \`FK_ebd16a55e8ad05fdb6cf0b325af\` FOREIGN KEY (\`eventId\`) REFERENCES \`event\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await queryRunner.query(`DROP INDEX \`REL_07a3ddf01665810c413f107656\` ON \`strava_account\``);
        await queryRunner.query(`DROP TABLE \`strava_account\``);
        await queryRunner.query(`DROP INDEX \`IDX_4504a5558a05961b081fdb5492\` ON \`notification\``);
        await queryRunner.query(`DROP TABLE \`notification\``);
        await queryRunner.query(`DROP INDEX \`UQ_attendance_user_training_date\` ON \`attendance\``);
        await queryRunner.query(`DROP TABLE \`attendance\``);
        await queryRunner.query(`DROP TABLE \`event_photo\``);
        await queryRunner.query(`DROP INDEX \`IDX_c90f7b35af81b5d9c85129e41d\` ON \`event_organizers\``);
        await queryRunner.query(`DROP INDEX \`IDX_a6d8e5f08cb91adb8467729fae\` ON \`event_organizers\``);
        await queryRunner.query(`DROP TABLE \`event_organizers\``);

        await queryRunner.query(`ALTER TABLE \`strava\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`strava\` DROP COLUMN \`averageCadence\``);
        await queryRunner.query(`ALTER TABLE \`strava\` DROP COLUMN \`maxHeartrate\``);
        await queryRunner.query(`ALTER TABLE \`strava\` DROP COLUMN \`averageHeartrate\``);
        await queryRunner.query(`ALTER TABLE \`event\` DROP COLUMN \`location\``);
        await queryRunner.query(`ALTER TABLE \`training\` DROP COLUMN \`campus\``);
        await queryRunner.query(`ALTER TABLE \`training\` DROP COLUMN \`level\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`campus\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`shift\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`course\``);
    }

}
