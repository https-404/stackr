import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      if (info) {
        this.logger.error(`JWT Authentication failed: ${info.message || info}`);
      }
      if (err) {
        this.logger.error(`JWT Authentication error: ${err.message}`);
      }
      throw err || new UnauthorizedException('Authentication failed');
    }
    return user;
  }
}

