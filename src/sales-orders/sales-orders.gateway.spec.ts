import { Test, TestingModule } from '@nestjs/testing';
import { SalesOrdersGateway } from './sales-orders.gateway';
import { SalesOrdersService } from './sales-orders.service';

describe('SalesOrdersGateway', () => {
  let gateway: SalesOrdersGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalesOrdersGateway, SalesOrdersService],
    }).compile();

    gateway = module.get<SalesOrdersGateway>(SalesOrdersGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
