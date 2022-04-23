import { MigrationInterface, QueryRunner } from 'typeorm';

export class MIGRATION1650695009237 implements MigrationInterface {
  name = 'MIGRATION1650695009237';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tags" (
          "id" SERIAL NOT NULL,
          "name" character varying NOT NULL,
          "tag" character varying NOT NULL,
          CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id")
        )`,
    );
    await queryRunner.query(
      `CREATE TABLE "events" (
          "id" character varying NOT NULL,
          "pubkey" character varying NOT NULL,
          "created_at" integer NOT NULL,
          "kind" integer NOT NULL,
          "content" character varying NOT NULL,
          "sig" character varying NOT NULL,
          CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id")
        )`,
    );
    await queryRunner.query(
      `CREATE TABLE "events_tags_tags" (
          "eventsId" character varying NOT NULL,
          "tagsId" integer NOT NULL,
          CONSTRAINT "PK_13656b477009896bf6208d49e98" PRIMARY KEY ("eventsId", "tagsId")
        )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0e8c19d2030804f10772a976b6" ON "events_tags_tags" ("eventsId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_20610fdef0224b44f806c9edf1" ON "events_tags_tags" ("tagsId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "events_tags_tags"
       ADD CONSTRAINT "FK_0e8c19d2030804f10772a976b6c"
       FOREIGN KEY ("eventsId") REFERENCES "events"("id")
       ON DELETE CASCADE
       ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "events_tags_tags"
       ADD CONSTRAINT "FK_20610fdef0224b44f806c9edf13"
       FOREIGN KEY ("tagsId") REFERENCES "tags"("id")
       ON DELETE NO ACTION
       ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "events_tags_tags"
       DROP CONSTRAINT "FK_20610fdef0224b44f806c9edf13"`,
    );
    await queryRunner.query(
      `ALTER TABLE "events_tags_tags"
       DROP CONSTRAINT "FK_0e8c19d2030804f10772a976b6c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_20610fdef0224b44f806c9edf1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0e8c19d2030804f10772a976b6"`,
    );
    await queryRunner.query(`DROP TABLE "events_tags_tags"`);
    await queryRunner.query(`DROP TABLE "events"`);
    await queryRunner.query(`DROP TABLE "tags"`);
  }
}
