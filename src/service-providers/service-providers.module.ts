import { Module, forwardRef } from '@nestjs/common';
import { ServiceProvidersService } from './service-providers.service';
import { ServiceProvidersGateway } from './service-providers.gateway';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/common/auth.module';
import { SearchModule } from 'src/search/search.module';
import { Catalog } from './entities/catalog.entity';
import { ServiceProvider, ProfessionalService, Employee, EmployeeJobs, ProfessionalServiceImage } from './entities/service-provider.entity';
import { BeautyProduct, BeautyService, BeautyProductServiceImage } from './entities/services.entity';
import { ServiceProvidersController } from './provider-providers.controller';
import { Vehicle, VehicleImage, VehicleDriver } from './entities/logistics.entity';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { SocketService } from 'src/sockets-gateway/service';
import SearchService from 'src/search/search.service';
import { JwtService } from '@nestjs/jwt';
import { UserWalletsService } from 'src/user-wallets/user-wallets.service';
import { SalesOrdersService } from 'src/sales-orders/sales-orders.service';
import { SalesOrdersModule } from 'src/sales-orders/sales-orders.module';

@Module({ 
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => SearchModule),
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
  providers: [ServiceProvidersGateway, ServiceProvidersService, SocketService, UsersService,SearchService,JwtService ,UserWalletsService, SalesOrdersService],
  controllers: [
    ServiceProvidersController
  ],
})
export class ServiceProvidersModule {}
