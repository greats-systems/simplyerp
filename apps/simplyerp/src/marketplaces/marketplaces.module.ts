import { Module } from '@nestjs/common';
import { MarketplacesService } from './marketplaces.service';
import { MarketplacesGateway } from './marketplaces.gateway';

@Module({
  providers: [MarketplacesGateway, MarketplacesService],
})
export class MarketplacesModule {}
