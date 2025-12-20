import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, ArrayMinSize } from 'class-validator';

export class AddUserGamesDto {
  @ApiProperty({
    description: 'Array of game IDs to add to user collection',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '223e4567-e89b-12d3-a456-426614174001',
    ],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one game ID is required' })
  @IsUUID('4', { each: true, message: 'Each game ID must be a valid UUID' })
  gameIds: string[];
}

