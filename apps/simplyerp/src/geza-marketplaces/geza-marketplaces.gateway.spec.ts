import { Test, TestingModule } from '@nestjs/testing';
import  GezaMarketplacesService  from './geza-marketplaces.service';

describe('GezaMarketplacesGateway', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ GezaMarketplacesService],
    }).compile();

  });

});
