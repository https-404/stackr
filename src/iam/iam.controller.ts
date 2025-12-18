import { Controller } from '@nestjs/common';
import { IamService } from './iam.service';

@Controller('iam')
export class IamController {
  constructor(private readonly iamService: IamService) {}
}
