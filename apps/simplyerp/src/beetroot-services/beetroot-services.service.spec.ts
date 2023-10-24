import { Test, TestingModule } from '@nestjs/testing';
import { BeetrootServicesService } from './beetroot-services.service';

describe('BeetrootServicesService', () => {
  let service: BeetrootServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BeetrootServicesService],
    }).compile();

    service = module.get<BeetrootServicesService>(BeetrootServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
