import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, MaxLength, MinLength } from 'class-validator';
import { CreateGameDto } from './create-game.dto';

export class UpdateGameDto extends PartialType(CreateGameDto) {
  @ApiProperty({ description: 'Game title', required: false, example: 'Super Mario Bros' })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiProperty({
    description: 'Game image URL',
    required: false,
    example: 'https://example.com/game-image.jpg',
  })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    description: 'Game description',
    required: false,
    example: 'A classic platformer game',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;
}

