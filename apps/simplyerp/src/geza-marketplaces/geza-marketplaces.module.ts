import { Module, forwardRef } from '@nestjs/common';
import  GezaMarketplacesService  from './geza-marketplaces.service';
import { ServiceProvidersService } from '../service-providers/service-providers.service';
// import SearchService from '../search/search.service';
import { HttpModule } from '@nestjs/axios';
// import { SearchModule } from '../search/search.module';
import { ServiceProvidersModule } from '../service-providers/service-providers.module';
import { UsersModule } from '../users/users.module';
import { SalesOrdersModule } from '../sales-orders/sales-orders.module';
import { SalesOrdersService } from '../sales-orders/sales-orders.service';
import GezaMarketplceController from './marketplace.controller';

@Module({
  imports: [
    // forwardRef(() => SearchModule),
    forwardRef(() => UsersModule), 
    forwardRef(() => HttpModule),
    forwardRef(() => SalesOrdersModule),
    forwardRef(() => ServiceProvidersModule),
  ],
  controllers: [
    GezaMarketplceController
  ],
  providers: [ GezaMarketplacesService, ServiceProvidersService, 
    // SearchService, 
    SalesOrdersService],
})
export class GezaMarketplacesModule {}
