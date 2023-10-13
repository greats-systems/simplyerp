import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {  ConnectedUser, Subscription, User } from './entities/user.entity';
import { AuthModule } from 'src/common/auth.module';
import { UsersController } from './users.controller';
import Message, { OTP } from './entities/message.entity';
import OfferItemsSearchService from 'src/search/search.service';
import { SearchModule } from 'src/search/search.module';
import LocalFilesService from 'src/files/localFiles.service';
import LocalFile from 'src/files/localFile.entity';
import { HttpModule } from '@nestjs/axios';
import { Wallet, WalletTransaction } from './entities/wallet.entity';
import { JwtService } from '@nestjs/jwt';
import { TransportOrder } from 'src/service-providers/entities/logistics.entity';
import { Employee, EmployeeJobs, ServiceProvider } from 'src/service-providers/entities/service-provider.entity';
import { SocketsGateway } from 'src/sockets-gateway/gateway';
import { SocketService } from 'src/sockets-gateway/service';
import { ServiceProvidersService } from 'src/service-providers/service-providers.service';
import { ServiceProvidersModule } from 'src/service-providers/service-providers.module';
import { UserWalletsModule } from 'src/user-wallets/user-wallets.module';
import { UserWalletsService } from 'src/user-wallets/user-wallets.service';
import { Order, OrderLine } from 'src/sales-orders/entities/order.entity';
import { SalesOrdersService } from 'src/sales-orders/sales-orders.service';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => SearchModule),
    forwardRef(() => HttpModule),    // forwardRef(() => ServiceProvidersModule),
    ServiceProvidersModule,
    
    TypeOrmModule.forFeature([
      ServiceProvider,
      User,
      Order,
      OrderLine,
      Message,
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
    OfferItemsSearchService,
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
