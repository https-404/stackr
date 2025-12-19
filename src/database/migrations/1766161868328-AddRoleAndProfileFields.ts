import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoleAndProfileFields1766161868328 implements MigrationInterface {
    name = 'AddRoleAndProfileFields1766161868328'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_profiles" ADD "first_name" character varying`);
        await queryRunner.query(`ALTER TABLE "user_profiles" ADD "last_name" character varying`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'admin')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "role" "public"."users_role_enum" NOT NULL DEFAULT 'user'`);
        await queryRunner.query(`ALTER TYPE "public"."auth_accounts_provider_type_enum" RENAME TO "auth_accounts_provider_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."auth_accounts_provider_type_enum" AS ENUM('email-password', 'google')`);
        await queryRunner.query(`ALTER TABLE "auth_accounts" ALTER COLUMN "provider_type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "auth_accounts" ALTER COLUMN "provider_type" TYPE "public"."auth_accounts_provider_type_enum" USING "provider_type"::"text"::"public"."auth_accounts_provider_type_enum"`);
        await queryRunner.query(`ALTER TABLE "auth_accounts" ALTER COLUMN "provider_type" SET DEFAULT 'email-password'`);
        await queryRunner.query(`DROP TYPE "public"."auth_accounts_provider_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."auth_accounts_provider_type_enum_old" AS ENUM('jwt', 'google')`);
        await queryRunner.query(`ALTER TABLE "auth_accounts" ALTER COLUMN "provider_type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "auth_accounts" ALTER COLUMN "provider_type" TYPE "public"."auth_accounts_provider_type_enum_old" USING "provider_type"::"text"::"public"."auth_accounts_provider_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "auth_accounts" ALTER COLUMN "provider_type" SET DEFAULT 'jwt'`);
        await queryRunner.query(`DROP TYPE "public"."auth_accounts_provider_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."auth_accounts_provider_type_enum_old" RENAME TO "auth_accounts_provider_type_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "user_profiles" DROP COLUMN "last_name"`);
        await queryRunner.query(`ALTER TABLE "user_profiles" DROP COLUMN "first_name"`);
    }

}
