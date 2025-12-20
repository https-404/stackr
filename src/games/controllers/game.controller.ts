import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { GameService } from '../services/game.service';
import { CreateGameDto } from '../dto/create-game.dto';
import { CreateGamesDto } from '../dto/create-games.dto';
import { UpdateGameDto } from '../dto/update-game.dto';
import { GameQueryDto } from '../dto/game-query.dto';
import { ApiResponseDto } from '../../common/dto/response.dto';
import { Game } from '../entities/game.entity';

@ApiTags('games')
@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  @ApiOperation({ summary: 'Create one or multiple games' })
  @ApiBody({ type: CreateGamesDto })
  @ApiResponse({
    status: 201,
    description: 'Games created successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'One or more games with these titles already exist' })
  async create(@Body() createGamesDto: CreateGamesDto): Promise<ApiResponseDto<Game[]>> {
    const games = await this.gameService.createMany(createGamesDto.games);
    const message =
      games.length === 1
        ? 'Game created successfully'
        : `${games.length} games created successfully`;
    return new ApiResponseDto(HttpStatus.CREATED, message, games);
  }

  @Get()
  @ApiOperation({ summary: 'Get all games with pagination and filters' })
  @ApiQuery({ type: GameQueryDto })
  @ApiResponse({
    status: 200,
    description: 'Games retrieved successfully',
    type: ApiResponseDto,
  })
  async findAll(@Query() queryDto: GameQueryDto): Promise<ApiResponseDto<any>> {
    const result = await this.gameService.findAll(queryDto);
    return new ApiResponseDto(HttpStatus.OK, 'Games retrieved successfully', result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a game by ID' })
  @ApiParam({ name: 'id', description: 'Game ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Game retrieved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Game not found' })
  async findOne(@Param('id') id: string): Promise<ApiResponseDto<Game>> {
    const game = await this.gameService.findOne(id);
    return new ApiResponseDto(HttpStatus.OK, 'Game retrieved successfully', game);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a game' })
  @ApiParam({ name: 'id', description: 'Game ID', type: 'string' })
  @ApiBody({ type: UpdateGameDto })
  @ApiResponse({
    status: 200,
    description: 'Game updated successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Game not found' })
  @ApiResponse({ status: 409, description: 'Game with this title already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateGameDto: UpdateGameDto,
  ): Promise<ApiResponseDto<Game>> {
    const game = await this.gameService.update(id, updateGameDto);
    return new ApiResponseDto(HttpStatus.OK, 'Game updated successfully', game);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a game' })
  @ApiParam({ name: 'id', description: 'Game ID', type: 'string' })
  @ApiResponse({ status: 204, description: 'Game deleted successfully' })
  @ApiResponse({ status: 404, description: 'Game not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.gameService.remove(id);
  }
}

