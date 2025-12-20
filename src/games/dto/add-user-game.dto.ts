import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddUserGameDto {
  @ApiProperty({
    description: 'Game ID to add to user collection',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  gameId: string;
}

