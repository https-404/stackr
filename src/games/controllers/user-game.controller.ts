import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserGameService } from '../services/user-game.service';
import { AddUserGameDto } from '../dto/add-user-game.dto';
import { ApiResponseDto } from '../../common/dto/response.dto';
import { JwtAuthGuard } from '../../iam/guards/jwt-auth.guard';
import type { Request } from 'express';

@ApiTags('games')
@Controller('games/my-games')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserGameController {
  constructor(private readonly userGameService: UserGameService) {}

  @Post()
  @ApiOperation({ summary: 'Add a game to your collection' })
  @ApiBody({ type: AddUserGameDto })
  @ApiResponse({
    status: 201,
    description: 'Game added to collection successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Game not found' })
  @ApiResponse({ status: 409, description: 'Game already in collection' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addGame(
    @Req() req: Request,
    @Body() addUserGameDto: AddUserGameDto,
  ): Promise<ApiResponseDto<any>> {
    const userId = (req.user as any).id;
    const result = await this.userGameService.addGameToUser(userId, addUserGameDto);
    return new ApiResponseDto(HttpStatus.CREATED, 'Game added to collection successfully', result);
  }

  @Get()
  @ApiOperation({ summary: 'Get all games in your collection' })
  @ApiResponse({
    status: 200,
    description: 'Games retrieved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyGames(@Req() req: Request): Promise<ApiResponseDto<any>> {
    const userId = (req.user as any).id;
    const games = await this.userGameService.getUserGames(userId);
    return new ApiResponseDto(HttpStatus.OK, 'Games retrieved successfully', games);
  }

  @Delete(':gameId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a game from your collection' })
  @ApiParam({ name: 'gameId', description: 'Game ID to remove', type: 'string' })
  @ApiResponse({ status: 204, description: 'Game removed from collection successfully' })
  @ApiResponse({ status: 404, description: 'Game not found in collection' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeGame(@Req() req: Request, @Param('gameId') gameId: string): Promise<void> {
    const userId = (req.user as any).id;
    await this.userGameService.removeGameFromUser(userId, gameId);
  }
}

