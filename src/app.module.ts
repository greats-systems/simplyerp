import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { SalesOrdersModule } from './sales-orders/sales-orders.module';
import { ServiceProvidersModule } from './service-providers/service-providers.module';
import { UserWalletsModule } from './user-wallets/user-wallets.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [CommonModule, UsersModule, ServiceProvidersModule, UserWalletsModule, SalesOrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
