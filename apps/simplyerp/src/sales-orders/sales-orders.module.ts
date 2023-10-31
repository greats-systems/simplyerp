import { Module, forwardRef } from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';
import { SalesOrdersGateway } from './sales-orders.gateway';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../common/auth.module';
// import { SearchModule } from '../search/search.module';
import { ServiceProvidersModule } from '../service-providers/service-providers.module';
import { UsersModule } from '../users/users.module';
// import SearchService from '../search/search.service';
import { ServiceProvidersService } from '../service-providers/service-providers.service';
import { SocketService } from '../sockets-gateway/service';
import { UsersService } from '../users/users.service';
import { UserWalletsService } from '../user-wallets/user-wallets.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    // forwardRef(() => SearchModule),
    forwardRef(() => HttpModule),
    forwardRef(() => UsersModule), 
    forwardRef(() => ServiceProvidersModule),

  ],
  providers: [SalesOrdersGateway, SalesOrdersService, SocketService, ServiceProvidersService, 
    // SearchService, 
    UsersService, UserWalletsService, JwtService]
})
export class SalesOrdersModule {}
