import { Test, TestingModule } from '@nestjs/testing';
import { UserWalletsGateway } from './user-wallets.gateway';
import { UserWalletsService } from './user-wallets.service';

describe('UserWalletsGateway', () => {
  let gateway: UserWalletsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserWalletsGateway, UserWalletsService],
    }).compile();

    gateway = module.get<UserWalletsGateway>(UserWalletsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
