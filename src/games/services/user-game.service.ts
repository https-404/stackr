import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGame } from '../entities/user-game.entity';
import { Game } from '../entities/game.entity';
import { AddUserGameDto } from '../dto/add-user-game.dto';

@Injectable()
export class UserGameService {
  constructor(
    @InjectRepository(UserGame)
    private readonly userGameRepository: Repository<UserGame>,
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
  ) {}

  async addGameToUser(userId: string, addUserGameDto: AddUserGameDto): Promise<UserGame> {
    // Check if game exists
    const game = await this.gameRepository.findOne({
      where: { id: addUserGameDto.gameId },
    });

    if (!game) {
      throw new NotFoundException(`Game with ID ${addUserGameDto.gameId} not found`);
    }

    // Check if user already has this game
    const existingUserGame = await this.userGameRepository.findOne({
      where: {
        userId,
        gameId: addUserGameDto.gameId,
      },
    });

    if (existingUserGame) {
      throw new ConflictException('Game is already in your collection');
    }

    const userGame = this.userGameRepository.create({
      userId,
      gameId: addUserGameDto.gameId,
    });

    return await this.userGameRepository.save(userGame);
  }

  async getUserGames(userId: string) {
    const userGames = await this.userGameRepository.find({
      where: { userId },
      relations: ['game'],
      order: { createdAt: 'DESC' },
    });

    return userGames.map((ug) => ({
      id: ug.id,
      game: ug.game,
      addedAt: ug.createdAt,
    }));
  }

  async removeGameFromUser(userId: string, gameId: string): Promise<void> {
    const userGame = await this.userGameRepository.findOne({
      where: {
        userId,
        gameId,
      },
    });

    if (!userGame) {
      throw new NotFoundException('Game not found in your collection');
    }

    await this.userGameRepository.remove(userGame);
  }

  async checkIfUserHasGame(userId: string, gameId: string): Promise<boolean> {
    const userGame = await this.userGameRepository.findOne({
      where: {
        userId,
        gameId,
      },
    });

    return !!userGame;
  }
}

