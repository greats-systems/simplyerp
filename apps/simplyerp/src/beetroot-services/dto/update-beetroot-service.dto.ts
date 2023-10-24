import { PartialType } from '@nestjs/mapped-types';
import { CreateBeetrootServiceDto } from './create-beetroot-service.dto';

export class UpdateBeetrootServiceDto extends PartialType(CreateBeetrootServiceDto) {
  id: number;
}
