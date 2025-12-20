import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { AuthAccount } from './entities/auth-account.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { UserService } from './services/user.service';
import { UserProfileService } from './services/user-profile.service';
import { AuthAccountService } from './services/auth-account.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { AuthService } from './services/auth.service';
import { PasswordService } from './services/password.service';
import { JwtAuthService } from './services/jwt.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleOAuthStrategy } from './strategies/google-oauth.strategy';
import { UserProfileController } from './controllers/user-profile.controller';
import { IamService } from './iam.service';
import { IamController } from './iam.controller';
import { RolesGuard } from './guards/roles.guard';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile, AuthAccount, RefreshToken]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m');
        return {
          secret: configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production',
          signOptions: {
            expiresIn: expiresIn as any,
          },
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule,
    CommonModule,
  ],
  controllers: [IamController, UserProfileController],
  providers: [
    IamService,
    UserService,
    UserProfileService,
    AuthAccountService,
    RefreshTokenService,
    AuthService,
    PasswordService,
    JwtAuthService,
    JwtStrategy,
    GoogleOAuthStrategy,
    RolesGuard,
  ],
  exports: [
    UserService,
    UserProfileService,
    AuthAccountService,
    RefreshTokenService,
    AuthService,
    JwtAuthService,
  ],
})
export class IamModule {}
