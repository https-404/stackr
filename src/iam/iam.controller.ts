import {
  Controller,
  Post,
  Body,
  Get,
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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './services/auth.service';
import { UserProfileService } from './services/user-profile.service';
import { UserProfile } from './entities/user-profile.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ApiResponseDto } from '../common/dto/response.dto';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { Request } from 'express';

@ApiTags('iam')
@Controller('iam')
export class IamController {
  constructor(
    private readonly authService: AuthService,
    private readonly userProfileService: UserProfileService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user with email and password' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto): Promise<ApiResponseDto<AuthResponseDto>> {
    const result = await this.authService.register(registerDto);
    return new ApiResponseDto(HttpStatus.CREATED, 'User registered successfully', result);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<ApiResponseDto<AuthResponseDto>> {
    const result = await this.authService.login(loginDto);
    return new ApiResponseDto(HttpStatus.OK, 'Login successful', result);
  }

  @Get('auth/google')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({
    summary: 'Initiate Google OAuth login',
    description:
      '⚠️ This endpoint must be accessed directly in a browser, not through Swagger. It will redirect to Google for authentication.',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to Google OAuth. Access this URL directly in your browser: http://localhost:3000/iam/auth/google',
  })
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('auth/google/callback')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({
    summary: 'Google OAuth callback',
    description:
      '⚠️ This is the callback URL that Google redirects to after authentication. Do not call this directly. It is automatically called by Google after successful authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Google OAuth login successful',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 401, description: 'OAuth authentication failed' })
  async googleAuthCallback(@Req() req: Request): Promise<ApiResponseDto<AuthResponseDto>> {
    const result = await this.authService.googleLogin(req.user);
    return new ApiResponseDto(HttpStatus.OK, 'Google OAuth login successful', result);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<ApiResponseDto<{ accessToken: string }>> {
    const result = await this.authService.refreshToken(refreshTokenDto.refreshToken);
    return new ApiResponseDto(HttpStatus.OK, 'Token refreshed successfully', result);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Body() refreshTokenDto: RefreshTokenDto): Promise<ApiResponseDto<null>> {
    await this.authService.logout(refreshTokenDto.refreshToken);
    return new ApiResponseDto(HttpStatus.OK, 'Logout successful', null);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user with full profile' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@Req() req: Request): Promise<ApiResponseDto<any>> {
    const userId = (req.user as any).id;
    const user = req.user as any;

    // Try to get profile, if it doesn't exist, return null values
    let profile: UserProfile | null = null;
    try {
      profile = await this.userProfileService.findOne(userId);
    } catch (error) {
      // Profile doesn't exist, will use null values below
    }

    // Return combined user and profile data with all fields, even if null
    const userData = {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      role: user.role,
      profile: {
        username: profile?.username ?? null,
        firstName: profile?.firstName ?? null,
        lastName: profile?.lastName ?? null,
        tagline: profile?.tagline ?? null,
        bio: profile?.bio ?? null,
        avatarUrl: profile?.avatarUrl ?? null,
        createdAt: profile?.createdAt ?? null,
        updatedAt: profile?.updatedAt ?? null,
      },
    };

    return new ApiResponseDto(HttpStatus.OK, 'User retrieved successfully', userData);
  }
}
