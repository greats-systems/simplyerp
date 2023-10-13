import { Module, forwardRef } from '@nestjs/common';
import { UserWalletsService } from './user-wallets.service';
import { UserWalletsGateway } from './user-wallets.gateway';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from 'src/common/auth.module';
import { SearchModule } from 'src/search/search.module';
import { ServiceProvidersModule } from 'src/service-providers/service-providers.module';
import { UsersModule } from 'src/users/users.module';
import SearchService from 'src/search/search.service';
import { ServiceProvidersService } from 'src/service-providers/service-providers.service';
import { SocketService } from 'src/sockets-gateway/service';
import { JwtService } from '@nestjs/jwt';
import { SalesOrdersService } from 'src/sales-orders/sales-orders.service';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => SearchModule),
    forwardRef(() => HttpModule),
    forwardRef(() => UsersModule),
    forwardRef(() => ServiceProvidersModule),
    forwardRef(() => UserWalletsModule),
  ],
    providers: [UserWalletsGateway, UserWalletsService, SocketService, ServiceProvidersService, SearchService,JwtService,SalesOrdersService ]
})
export class UserWalletsModule {}
