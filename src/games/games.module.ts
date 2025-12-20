import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { UserGame } from './entities/user-game.entity';
import { GameService } from './services/game.service';
import { UserGameService } from './services/user-game.service';
import { GameController } from './controllers/game.controller';
import { UserGameController } from './controllers/user-game.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Game, UserGame])],
  controllers: [GameController, UserGameController],
  providers: [GameService, UserGameService],
  exports: [GameService, UserGameService],
})
export class GamesModule {}

