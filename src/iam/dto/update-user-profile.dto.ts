import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserProfileDto } from './create-user-profile.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

export class UpdateUserProfileDto extends PartialType(
  OmitType(CreateUserProfileDto, ['userId'] as const)
) {
  @ApiProperty({ description: 'Username (unique)', required: false, example: 'johndoe' })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(30)
  username?: string;

  @ApiProperty({ description: 'First name', required: false, example: 'John' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  firstName?: string;

  @ApiProperty({ description: 'Last name', required: false, example: 'Doe' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  lastName?: string;

  @ApiProperty({ description: 'User tagline', required: false, example: 'Full-stack developer' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  tagline?: string;

  @ApiProperty({ description: 'User bio', required: false, example: 'Passionate developer...' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;
}

