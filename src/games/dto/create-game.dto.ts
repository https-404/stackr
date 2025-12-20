import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, MaxLength, MinLength } from 'class-validator';

export class CreateGameDto {
  @ApiProperty({ description: 'Game title', example: 'Super Mario Bros' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

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

