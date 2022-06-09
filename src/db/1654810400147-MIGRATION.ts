import { MigrationInterface, QueryRunner } from 'typeorm';

export class MIGRATION1654810400147 implements MigrationInterface {
  name = 'MIGRATION1654810400147';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "events" RENAME COLUMN "pubkey" TO "pubkeyId"`,
    );
    await queryRunner.query(
      `CREATE TABLE "pubkeys" ("id" SERIAL NOT NULL, "value" character varying NOT NULL, CONSTRAINT "UQ_55aa245f081be13d5ee22bce03b" UNIQUE ("value"), CONSTRAINT "PK_9759cb5c16db22e71e99c315d19" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "metadata" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "about" character varying NOT NULL, "picture" character varying NOT NULL, CONSTRAINT "PK_56b22355e89941b9792c04ab176" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "tags" DROP COLUMN "name"`);
    await queryRunner.query(`ALTER TABLE "tags" DROP COLUMN "tag"`);
    await queryRunner.query(
      `ALTER TABLE "tags" ADD "type" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tags" ADD "value" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tags" ADD "recommended_relay_url" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "pubkeyId"`);
    await queryRunner.query(`ALTER TABLE "events" ADD "pubkeyId" integer`);
    await queryRunner.query(
      `ALTER TABLE "tags" ADD CONSTRAINT "unique_tag" UNIQUE ("type", "value", "recommended_relay_url")`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" ADD CONSTRAINT "FK_53c524a9e01e06eadc19f8ab8e8" FOREIGN KEY ("pubkeyId") REFERENCES "pubkeys"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "events" DROP CONSTRAINT "FK_53c524a9e01e06eadc19f8ab8e8"`,
    );
    await queryRunner.query(`ALTER TABLE "tags" DROP CONSTRAINT "unique_tag"`);
    await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "pubkeyId"`);
    await queryRunner.query(
      `ALTER TABLE "events" ADD "pubkeyId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tags" DROP COLUMN "recommended_relay_url"`,
    );
    await queryRunner.query(`ALTER TABLE "tags" DROP COLUMN "value"`);
    await queryRunner.query(`ALTER TABLE "tags" DROP COLUMN "type"`);
    await queryRunner.query(
      `ALTER TABLE "tags" ADD "tag" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tags" ADD "name" character varying NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "metadata"`);
    await queryRunner.query(`DROP TABLE "pubkeys"`);
    await queryRunner.query(
      `ALTER TABLE "events" RENAME COLUMN "pubkeyId" TO "pubkey"`,
    );
  }
}
