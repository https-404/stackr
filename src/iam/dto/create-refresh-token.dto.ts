import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsDateString } from 'class-validator';

export class CreateRefreshTokenDto {
  @ApiProperty({ description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Token hash', example: 'hashed_token_string' })
  @IsString()
  tokenHash: string;

  @ApiProperty({ description: 'Token expiration date', example: '2024-12-31T23:59:59Z' })
  @IsDateString()
  expiresAt: string;
}

