import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewColumToVehicleVin1750855815188
  implements MigrationInterface
{
  name = 'AddNewColumToVehicleVin1750855815188';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add "status" if it doesn't exist
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'vehicle_vins'
            AND column_name = 'status'
        ) THEN
          ALTER TABLE "vehicle_vins" ADD "status" VARCHAR DEFAULT 'DRAFT';
        END IF;
      END
      $$;
    `);

    // Add "is_inspect"
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'vehicle_vins'
            AND column_name = 'is_inspect'
        ) THEN
          ALTER TABLE "vehicle_vins" ADD "is_inspect" BOOLEAN NOT NULL DEFAULT false;
        END IF;
      END
      $$;
    `);

    // Add "is_report"
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'vehicle_vins'
            AND column_name = 'is_report'
        ) THEN
          ALTER TABLE "vehicle_vins" ADD "is_report" BOOLEAN NOT NULL DEFAULT false;
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vehicle_vins" DROP COLUMN IF EXISTS "status"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicle_vins" DROP COLUMN IF EXISTS "is_inspect"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicle_vins" DROP COLUMN IF EXISTS "is_report"`,
    );
  }
}
