import { Module, forwardRef } from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';
import { SalesOrdersGateway } from './sales-orders.gateway';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from 'src/common/auth.module';
import { SearchModule } from 'src/search/search.module';
import { ServiceProvidersModule } from 'src/service-providers/service-providers.module';
import { UsersModule } from 'src/users/users.module';
import SearchService from 'src/search/search.service';
import { ServiceProvidersService } from 'src/service-providers/service-providers.service';
import { SocketService } from 'src/sockets-gateway/service';
import { UsersService } from 'src/users/users.service';
import { UserWalletsService } from 'src/user-wallets/user-wallets.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => SearchModule),
    forwardRef(() => HttpModule),
    forwardRef(() => UsersModule), 
    forwardRef(() => ServiceProvidersModule),

  ],
  providers: [SalesOrdersGateway, SalesOrdersService, SocketService, ServiceProvidersService, SearchService, UsersService, UserWalletsService, JwtService]
})
export class SalesOrdersModule {}
