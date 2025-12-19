import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserProfileService } from '../services/user-profile.service';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { ApiResponseDto } from '../../common/dto/response.dto';
import { UserProfile } from '../entities/user-profile.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { Request } from 'express';

@ApiTags('iam')
@Controller('iam/profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User profile not found' })
  async getProfile(@Req() req: Request): Promise<ApiResponseDto<UserProfile>> {
    const userId = (req.user as any).id;
    const profile = await this.userProfileService.findOne(userId);
    return new ApiResponseDto(HttpStatus.OK, 'User profile retrieved successfully', profile);
  }

  @Patch()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: UpdateUserProfileDto })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User profile not found' })
  @ApiResponse({ status: 409, description: 'Username is already taken' })
  async updateProfile(
    @Req() req: Request,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<ApiResponseDto<UserProfile>> {
    const userId = (req.user as any).id;
    const profile = await this.userProfileService.update(userId, updateUserProfileDto);
    return new ApiResponseDto(HttpStatus.OK, 'User profile updated successfully', profile);
  }
}
