import { Test, TestingModule } from '@nestjs/testing';
import { MarketplacesGateway } from './marketplaces.gateway';
import { MarketplacesService } from './marketplaces.service';

describe('MarketplacesGateway', () => {
  let gateway: MarketplacesGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarketplacesGateway, MarketplacesService],
    }).compile();

    gateway = module.get<MarketplacesGateway>(MarketplacesGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
