import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {  ConnectedUser, Subscription, User } from './entities/user.entity';
import { AuthModule } from '../common/auth.module';
import { UsersController } from './users.controller';
import  { OTP } from './entities/message.entity';
// import OfferItemsSearchService from '../search/search.service';
// import { SearchModule } from '../search/search.module';
import LocalFilesService from '../files/localFiles.service';
import LocalFile from '../files/localFile.entity';
import { HttpModule } from '@nestjs/axios';
import { Wallet, WalletTransaction } from './entities/wallet.entity';
import { JwtService } from '@nestjs/jwt';
import { TransportOrder } from '../service-providers/entities/logistics.entity';
import { Employee, EmployeeJobs, ServiceProvider } from '../service-providers/entities/service-provider.entity';
import { SocketsGateway } from '../sockets-gateway/gateway';
import { SocketService } from '../sockets-gateway/service';
import { ServiceProvidersService } from '../service-providers/service-providers.service';
import { ServiceProvidersModule } from '../service-providers/service-providers.module';
import { UserWalletsService } from '../user-wallets/user-wallets.service';
import { Order, OrderLine } from '../sales-orders/entities/order.entity';
import { SalesOrdersService } from '../sales-orders/sales-orders.service';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    // forwardRef(() => SearchModule),
    forwardRef(() => HttpModule),    // forwardRef(() => ServiceProvidersModule),
    ServiceProvidersModule,
    
    TypeOrmModule.forFeature([
      ServiceProvider,
      User,
      Order,
      OrderLine,
      OTP,
      LocalFile,
      ConnectedUser,
      TransportOrder,
      Wallet,
      WalletTransaction,
      Employee,
      EmployeeJobs,
      Subscription,

      
    ]),
  ],
  providers: [
    UsersService,
    SocketService,
    SocketsGateway,
    ServiceProvidersService,
    // OfferItemsSearchService,
    LocalFilesService,
    JwtService,
    SalesOrdersService,
    UserWalletsService
  ],
  exports: [
    UsersService,
    SocketService,
    TypeOrmModule,
    
    LocalFilesService,
  ],
  controllers: [
    UsersController,

  ],
})
export class UsersModule {}
