import { Module, forwardRef } from '@nestjs/common';
import { UserWalletsService } from './user-wallets.service';
import { UserWalletsGateway } from './user-wallets.gateway';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../common/auth.module';
// import { SearchModule } from '../search/search.module';
import { ServiceProvidersModule } from '../service-providers/service-providers.module';
import { UsersModule } from '../users/users.module';
// import SearchService from '../search/search.service';
import { ServiceProvidersService } from '../service-providers/service-providers.service';
import { SocketService } from '../sockets-gateway/service';
import { JwtService } from '@nestjs/jwt';
import { SalesOrdersService } from '../sales-orders/sales-orders.service';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    // forwardRef(() => SearchModule),
    forwardRef(() => HttpModule),
    forwardRef(() => UsersModule),
    forwardRef(() => ServiceProvidersModule),
    forwardRef(() => UserWalletsModule),
  ],
    providers: [UserWalletsGateway, UserWalletsService, SocketService, ServiceProvidersService, 
      // SearchService,
      JwtService,SalesOrdersService ]
})
export class UserWalletsModule {}
