import { Controller, Post, Body } from '@nestjs/common';

import { TransferToWalletDTO, WalletRegistrationRequest } from 'src/users/dto/wallet-create.dto';
import { UserWalletsService } from './user-wallets.service';


@Controller('wallet-service')
export class UserWalletController {
  constructor(
    private readonly userWalletsService: UserWalletsService,
  ) { }

  // get-all-account-orders
  @Post('register-new-wallet')
  registerWallet(@Body() createWalletDTO: WalletRegistrationRequest) {
    console.log('requestToTradeCommodityDTO')
    console.log(createWalletDTO)
    return this.userWalletsService.registerWallet(createWalletDTO);
  }
  @Post('make-direct-transfer')
  makeDirectTransfer(@Body() transferToWalletDTO: TransferToWalletDTO) {
    console.log('make Direct Transfer')
    console.log(transferToWalletDTO)
    return this.userWalletsService.makeDirectTransfer(transferToWalletDTO);
  }

  @Post('find-wallet')
  findWallet(@Body() transferToWalletDTO: TransferToWalletDTO) {
    console.log('make Direct Transfer')
    console.log(transferToWalletDTO)
    return this.userWalletsService.findWallet(transferToWalletDTO.senderUserID);
  }
}
