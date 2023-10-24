import { Test, TestingModule } from '@nestjs/testing';
import { BeetrootServicesGateway } from './beetroot-services.gateway';
import { BeetrootServicesService } from './beetroot-services.service';

describe('BeetrootServicesGateway', () => {
  let gateway: BeetrootServicesGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BeetrootServicesGateway, BeetrootServicesService],
    }).compile();

    gateway = module.get<BeetrootServicesGateway>(BeetrootServicesGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
