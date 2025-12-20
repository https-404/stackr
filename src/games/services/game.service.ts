import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Game } from '../entities/game.entity';
import { CreateGameDto } from '../dto/create-game.dto';
import { UpdateGameDto } from '../dto/update-game.dto';
import { GameQueryDto } from '../dto/game-query.dto';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
  ) {}

  async create(createGameDto: CreateGameDto): Promise<Game> {
    // Check if game with same title already exists (case-insensitive)
    const existingGame = await this.gameRepository.findOne({
      where: { title: ILike(createGameDto.title) },
    });

    if (existingGame) {
      throw new ConflictException(`Game with title "${createGameDto.title}" already exists`);
    }

    const game = this.gameRepository.create(createGameDto);
    return await this.gameRepository.save(game);
  }

  async createMany(createGamesDto: CreateGameDto[]): Promise<Game[]> {
    const games: Game[] = [];
    const errors: string[] = [];

    // Check for duplicates within the request
    const titles = createGamesDto.map((dto) => dto.title.toLowerCase());
    const duplicateTitles = titles.filter((title, index) => titles.indexOf(title) !== index);
    if (duplicateTitles.length > 0) {
      throw new ConflictException(
        `Duplicate titles in request: ${[...new Set(duplicateTitles)].join(', ')}`,
      );
    }

    // Check each game against existing games
    for (const createGameDto of createGamesDto) {
      const existingGame = await this.gameRepository.findOne({
        where: { title: ILike(createGameDto.title) },
      });

      if (existingGame) {
        errors.push(`Game with title "${createGameDto.title}" already exists`);
      } else {
        const game = this.gameRepository.create(createGameDto);
        games.push(game);
      }
    }

    // If any games already exist, throw error with all conflicts
    if (errors.length > 0) {
      throw new ConflictException(errors.join('; '));
    }

    // Save all games
    return await this.gameRepository.save(games);
  }

  async findAll(queryDto: GameQueryDto) {
    const { page = 1, limit = 10, title } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.gameRepository.createQueryBuilder('game');

    if (title) {
      queryBuilder.andWhere('game.title ILIKE :title', { title: `%${title}%` });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('game.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Game> {
    const game = await this.gameRepository.findOne({
      where: { id },
    });

    if (!game) {
      throw new NotFoundException(`Game with ID ${id} not found`);
    }

    return game;
  }

  async update(id: string, updateGameDto: UpdateGameDto): Promise<Game> {
    const game = await this.findOne(id);

    // Check if title is being changed and if it conflicts
    if (updateGameDto.title && updateGameDto.title !== game.title) {
      const existingGame = await this.gameRepository.findOne({
        where: { title: updateGameDto.title },
      });
      if (existingGame && existingGame.id !== id) {
        throw new ConflictException('Game with this title already exists');
      }
    }

    Object.assign(game, updateGameDto);
    return await this.gameRepository.save(game);
  }

  async remove(id: string): Promise<void> {
    const game = await this.findOne(id);
    await this.gameRepository.remove(game);
  }
}

