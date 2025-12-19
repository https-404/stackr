import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenService } from './refresh-token.service';
import * as crypto from 'crypto';

export interface CustomJwtPayload {
  sub: string; // user id
  email: string;
  type: 'access' | 'refresh';
}

@Injectable()
export class JwtAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async generateTokens(userId: string, email: string) {
    const accessTokenPayload: CustomJwtPayload = {
      sub: userId,
      email,
      type: 'access',
    };

    const refreshTokenPayload: CustomJwtPayload = {
      sub: userId,
      email,
      type: 'refresh',
    };

    const accessToken = this.jwtService.sign(accessTokenPayload, {
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m') as any,
    });

    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d') as any,
    });

    // Hash refresh token and store in database
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.refreshTokenService.create({
      userId,
      tokenHash,
      expiresAt: expiresAt.toISOString(),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<CustomJwtPayload>(refreshToken);

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Check if token is revoked
      const tokenHash = this.hashToken(refreshToken);
      const storedToken = await this.refreshTokenService.findByTokenHash(tokenHash);

      if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Token is invalid or expired');
      }

      // Generate new access token
      const accessTokenPayload: CustomJwtPayload = {
        sub: payload.sub,
        email: payload.email,
        type: 'access',
      };

      const accessToken = this.jwtService.sign(accessTokenPayload, {
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m') as any,
      });

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    await this.refreshTokenService.revokeByTokenHash(tokenHash);
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}

