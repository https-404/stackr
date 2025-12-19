import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';
import { CreateRefreshTokenDto } from '../dto/create-refresh-token.dto';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async create(createRefreshTokenDto: CreateRefreshTokenDto): Promise<RefreshToken> {
    const refreshToken = this.refreshTokenRepository.create({
      userId: createRefreshTokenDto.userId,
      tokenHash: createRefreshTokenDto.tokenHash,
      expiresAt: new Date(createRefreshTokenDto.expiresAt),
    });

    return await this.refreshTokenRepository.save(refreshToken);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    return await this.refreshTokenRepository.findOne({
      where: { tokenHash },
    });
  }

  async revokeByTokenHash(tokenHash: string): Promise<void> {
    const refreshToken = await this.findByTokenHash(tokenHash);
    if (refreshToken && !refreshToken.revokedAt) {
      refreshToken.revokedAt = new Date();
      await this.refreshTokenRepository.save(refreshToken);
    }
  }
}
