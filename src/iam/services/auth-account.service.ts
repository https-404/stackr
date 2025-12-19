import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthAccount, ProviderType } from '../entities/auth-account.entity';

interface CreateAuthAccountData {
  userId: string;
  providerType: ProviderType;
  providerUserId?: string;
  passwordHash?: string;
}

interface UpdateAuthAccountData {
  providerType?: ProviderType;
  providerUserId?: string;
  passwordHash?: string;
}

@Injectable()
export class AuthAccountService {
  constructor(
    @InjectRepository(AuthAccount)
    private readonly authAccountRepository: Repository<AuthAccount>,
  ) {}

  async create(data: CreateAuthAccountData): Promise<AuthAccount> {
    // Check if account already exists for this provider
    const existingAccount = await this.authAccountRepository.findOne({
      where: {
        userId: data.userId,
        providerType: data.providerType,
      },
    });

    if (existingAccount) {
      throw new ConflictException(
        `Auth account with provider ${data.providerType} already exists for this user`,
      );
    }

    const authAccount = this.authAccountRepository.create(data);
    return await this.authAccountRepository.save(authAccount);
  }

  async findByProvider(
    userId: string,
    providerType: ProviderType,
  ): Promise<AuthAccount | null> {
    return await this.authAccountRepository.findOne({
      where: { userId, providerType },
    });
  }

  async update(id: string, data: UpdateAuthAccountData): Promise<AuthAccount> {
    const authAccount = await this.authAccountRepository.findOne({
      where: { id },
    });

    if (!authAccount) {
      throw new ConflictException('Auth account not found');
    }

    // Check if provider type is being changed and if it conflicts
    if (data.providerType && data.providerType !== authAccount.providerType) {
      const existingAccount = await this.findByProvider(
        authAccount.userId,
        data.providerType,
      );
      if (existingAccount && existingAccount.id !== id) {
        throw new ConflictException(
          `Auth account with provider ${data.providerType} already exists for this user`,
        );
      }
    }

    Object.assign(authAccount, data);
    return await this.authAccountRepository.save(authAccount);
  }
}
