import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserProfileService } from '../services/user-profile.service';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { ApiResponseDto } from '../../common/dto/response.dto';
import { UserProfile } from '../entities/user-profile.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { StorageService } from '../../common/services/storage.service';
import type { Request } from 'express';

@ApiTags('iam')
@Controller('iam/profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserProfileController {
  constructor(
    private readonly userProfileService: UserProfileService,
    private readonly storageService: StorageService,
  ) {}

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
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: {
        fileSize: 512 * 1024, // 512 KB
      },
    }),
  )
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Username (unique)',
          example: 'johndoe',
        },
        firstName: {
          type: 'string',
          description: 'First name',
          example: 'John',
        },
        lastName: {
          type: 'string',
          description: 'Last name',
          example: 'Doe',
        },
        tagline: {
          type: 'string',
          description: 'User tagline',
          example: 'Full-stack developer',
        },
        bio: {
          type: 'string',
          description: 'User bio',
          example: 'Passionate developer...',
        },
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image (max 512 KB, image/* only)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid file or validation error' })
  @ApiResponse({ status: 404, description: 'User profile not found' })
  @ApiResponse({ status: 409, description: 'Username is already taken' })
  async updateProfile(
    @Req() req: Request,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ): Promise<ApiResponseDto<UserProfile>> {
    const userId = (req.user as any).id;

    // If avatar is uploaded, upload to Supabase and get URL
    if (avatar) {
      // Delete old avatar if exists
      const currentProfile = await this.userProfileService.findOne(userId);
      if (currentProfile.avatarUrl) {
        await this.storageService.deleteImage(currentProfile.avatarUrl);
      }

      // Upload new avatar
      const avatarUrl = await this.storageService.uploadImage(avatar, userId, 'avatars');
      updateUserProfileDto = { ...updateUserProfileDto, avatarUrl } as any;
    }

    const profile = await this.userProfileService.update(userId, updateUserProfileDto);
    return new ApiResponseDto(HttpStatus.OK, 'User profile updated successfully', profile);
  }
}
