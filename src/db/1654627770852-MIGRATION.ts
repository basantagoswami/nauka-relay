import { MigrationInterface, QueryRunner } from 'typeorm';

export class MIGRATION1654627770852 implements MigrationInterface {
  name = 'MIGRATION1654627770852';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tags"
       ADD "recommended_relay_url" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tags"
       DROP COLUMN "recommended_relay_url"`,
    );
  }
}
