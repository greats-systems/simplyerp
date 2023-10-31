import { Module, forwardRef } from '@nestjs/common';
import { ServiceProvidersService } from './service-providers.service';
import { ServiceProvidersGateway } from './service-providers.gateway';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../common/auth.module';
// import { SearchModule } from '../search/search.module';
import { Catalog } from './entities/catalog.entity';
import { ServiceProvider, ProfessionalService, Employee, EmployeeJobs, ProfessionalServiceImage } from './entities/service-provider.entity';
import { BeautyProduct, BeautyService, BeautyProductServiceImage } from './entities/services.entity';
import { ServiceProvidersController } from './provider-providers.controller';
import { Vehicle, VehicleImage, VehicleDriver } from './entities/logistics.entity';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { SocketService } from '../sockets-gateway/service';
// import SearchService from '../search/search.service';
import { JwtService } from '@nestjs/jwt';
import { UserWalletsService } from '../user-wallets/user-wallets.service';
import { SalesOrdersService } from '../sales-orders/sales-orders.service';
import { SalesOrdersModule } from '../sales-orders/sales-orders.module';
import { BeautyServiceService } from './beauty_service.service';

@Module({ 
  imports: [
    forwardRef(() => AuthModule),
    // forwardRef(() => SearchModule),
    forwardRef(() => HttpModule),
    forwardRef(() => UsersModule), 
    forwardRef(() => SalesOrdersModule),
    TypeOrmModule.forFeature([
      Employee,
      EmployeeJobs,
      Vehicle,
      VehicleImage,
      VehicleDriver,
      Catalog,
      BeautyProduct,
      BeautyService,
      BeautyProductServiceImage,
      ServiceProvider,
      ProfessionalService,
      ProfessionalServiceImage,
      ServiceProvidersService
    ]),
  ],
  exports: [
    TypeOrmModule,
  ],
  providers: [ServiceProvidersGateway, ServiceProvidersService,BeautyServiceService, SocketService, UsersService,
    // SearchService,
    JwtService ,UserWalletsService, SalesOrdersService],
  controllers: [
    ServiceProvidersController
  ],
})
export class ServiceProvidersModule {}
