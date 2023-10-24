import { PartialType } from '@nestjs/mapped-types';
import { CreateGezaMarketplaceDto } from './create-geza-marketplace.dto';

export class UpdateGezaMarketplaceDto extends PartialType(CreateGezaMarketplaceDto) {
  id: number;
}
