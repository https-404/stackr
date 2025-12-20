import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserGamesTable1766164405722 implements MigrationInterface {
    name = 'CreateUserGamesTable1766164405722'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_games" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "game_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a0c46573b2eeb903a867999c159" UNIQUE ("user_id", "game_id"), CONSTRAINT "PK_c9cc6a3afdc17ef440abea3b055" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_games" ADD CONSTRAINT "FK_9432b81f913c6e29e5391038981" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_games" ADD CONSTRAINT "FK_52610929b0f86d508a20769bd9a" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_games" DROP CONSTRAINT "FK_52610929b0f86d508a20769bd9a"`);
        await queryRunner.query(`ALTER TABLE "user_games" DROP CONSTRAINT "FK_9432b81f913c6e29e5391038981"`);
        await queryRunner.query(`DROP TABLE "user_games"`);
    }

}
