import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { SalesOrdersModule } from './sales-orders/sales-orders.module';
import { ServiceProvidersModule } from './service-providers/service-providers.module';
import { UserWalletsModule } from './user-wallets/user-wallets.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { BeetrootServicesModule } from './beetroot-services/beetroot-services.module';
import { MarketplacesModule } from './marketplaces/marketplaces.module';
import { GezaMarketplacesModule } from './geza-marketplaces/geza-marketplaces.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MessagingModule } from './messaging/messaging.module';

@Module({
  
  imports: [
    EventEmitterModule.forRoot({
      // set this to `true` to use wildcards
      wildcard: false,
      // the delimiter used to segment namespaces
      delimiter: '.',
      // set this to `true` if you want to emit the newListener event
      newListener: false,
      // set this to `true` if you want to emit the removeListener event
      removeListener: false,
      // the maximum amount of listeners that can be assigned to an event
      maxListeners: 0,
      // show event name in memory leak message when more than maximum amount of listeners is assigned
      verboseMemoryLeak: false,
      // disable throwing uncaughtException if an error event is emitted and it has no listeners
      ignoreErrors: false,
    }),
    CommonModule, UsersModule, ServiceProvidersModule, UserWalletsModule, SalesOrdersModule, AdminModule, BeetrootServicesModule, MarketplacesModule, GezaMarketplacesModule, MessagingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
