import { Test, TestingModule } from '@nestjs/testing';
import { ServiceProvidersGateway } from './service-providers.gateway';
import { ServiceProvidersService } from './service-providers.service';

describe('ServiceProvidersGateway', () => {
  let gateway: ServiceProvidersGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceProvidersGateway, ServiceProvidersService],
    }).compile();

    gateway = module.get<ServiceProvidersGateway>(ServiceProvidersGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
