import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ApiResponseDto } from './common/dto/response.dto';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get hello message' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns a hello message',
    type: ApiResponseDto 
  })
  getHello(): ApiResponseDto<string> {
    const message = this.appService.getHello();
    return new ApiResponseDto(200, 'Success', message);
  }
}
