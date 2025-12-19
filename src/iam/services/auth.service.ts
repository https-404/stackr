import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthAccountService } from './auth-account.service';
import { UserProfileService } from './user-profile.service';
import { PasswordService } from './password.service';
import { JwtAuthService } from './jwt.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { ProviderType } from '../entities/auth-account.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly authAccountService: AuthAccountService,
    private readonly userProfileService: UserProfileService,
    private readonly passwordService: PasswordService,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create user
    const user = await this.userService.create({
      email: registerDto.email,
      emailVerified: false,
      isActive: true,
    });

    // Hash password and create auth account
    const passwordHash = await this.passwordService.hashPassword(registerDto.password);
    await this.authAccountService.create({
      userId: user.id,
      providerType: ProviderType.EMAIL_PASSWORD,
      passwordHash,
    });

    // Auto-create profile (empty, user will fill username later)
    await this.userProfileService.create({
      userId: user.id,
    });

    // Generate tokens
    const tokens = await this.jwtAuthService.generateTokens(user.id, user.email);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Find user by email
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Find email-password auth account
    const authAccount = await this.authAccountService.findByProvider(
      user.id,
      ProviderType.EMAIL_PASSWORD,
    );

    if (!authAccount || !authAccount.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.passwordService.comparePassword(
      loginDto.password,
      authAccount.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.jwtAuthService.generateTokens(user.id, user.email);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        role: user.role,
      },
    };
  }

  async googleLogin(googleUser: any): Promise<AuthResponseDto> {
    if (!googleUser || !googleUser.email) {
      throw new BadRequestException('Invalid Google user data');
    }

    // Check if user exists
    let user = await this.userService.findByEmail(googleUser.email);

    if (!user) {
      // Create new user
      user = await this.userService.create({
        email: googleUser.email,
        emailVerified: true, // Google emails are verified
        isActive: true,
      });
    }

    // Check if Google auth account exists
    let authAccount = await this.authAccountService.findByProvider(
      user.id,
      ProviderType.GOOGLE,
    );

    if (!authAccount) {
      // Create Google auth account
      await this.authAccountService.create({
        userId: user.id,
        providerType: ProviderType.GOOGLE,
        providerUserId: googleUser.providerId,
      });
    } else if (authAccount.providerUserId !== googleUser.providerId) {
      // Update provider user ID if it changed
      await this.authAccountService.update(authAccount.id, {
        providerUserId: googleUser.providerId,
      });
    }

    // Auto-create or update profile with Google data
    try {
      const existingProfile = await this.userProfileService.findOne(user.id);
      // Update profile with Google data if available
      await this.userProfileService.update(user.id, {
        firstName: googleUser.firstName || existingProfile.firstName,
        lastName: googleUser.lastName || existingProfile.lastName,
        avatarUrl: googleUser.picture || existingProfile.avatarUrl,
      });
    } catch {
      // Profile doesn't exist, create it with Google data
      await this.userProfileService.create({
        userId: user.id,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        avatarUrl: googleUser.picture,
      });
    }

    // Generate tokens
    const tokens = await this.jwtAuthService.generateTokens(user.id, user.email);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        role: user.role,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    return await this.jwtAuthService.refreshAccessToken(refreshToken);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.jwtAuthService.revokeRefreshToken(refreshToken);
  }
}
