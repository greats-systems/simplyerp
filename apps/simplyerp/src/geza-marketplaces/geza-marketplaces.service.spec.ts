import { Test, TestingModule } from '@nestjs/testing';
import  GezaMarketplacesService  from './geza-marketplaces.service';

describe('GezaMarketplacesService', () => {
  let service: GezaMarketplacesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GezaMarketplacesService],
    }).compile();

    service = module.get<GezaMarketplacesService>(GezaMarketplacesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
