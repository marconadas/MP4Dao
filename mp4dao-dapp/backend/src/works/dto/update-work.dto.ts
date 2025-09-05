import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateWorkDto } from './create-work.dto';

export class UpdateWorkDto extends PartialType(
  OmitType(CreateWorkDto, [
    'authors', 
    'workHash', 
    'blockchainTxHash'
  ] as const)
) {}
