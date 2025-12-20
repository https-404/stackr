import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateGameDto } from './create-game.dto';

export class CreateGamesDto {
  @ApiProperty({
    description: 'Array of games to create',
    type: [CreateGameDto],
    example: [
      {
        title: 'Super Mario Bros',
        imageUrl: 'https://example.com/mario.jpg',
        description: 'A classic platformer game',
      },
      {
        title: 'The Legend of Zelda',
        imageUrl: 'https://example.com/zelda.jpg',
        description: 'An action-adventure game',
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one game is required' })
  @ValidateNested({ each: true })
  @Type(() => CreateGameDto)
  games: CreateGameDto[];
}

