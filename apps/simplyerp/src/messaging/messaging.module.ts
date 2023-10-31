import { Module, forwardRef } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { MessagingGateway } from './messaging.gateway';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../common/auth.module';
import { SearchModule } from '../search/search.module';
import { ServiceProvidersModule } from '../service-providers/service-providers.module';
import { UsersModule } from '../users/users.module';
import { JwtService } from '@nestjs/jwt';
import { BeetrootServicesService } from '../beetroot-services/beetroot-services.service';
import { ExhibitService } from '../beetroot-services/exhibit-service';
import { QuestionService } from '../beetroot-services/question-service';
import { SalesOrdersService } from '../sales-orders/sales-orders.service';
import SearchService from '../search/search.service';
import { ServiceProvidersGateway } from '../service-providers/service-providers.gateway';
import { ServiceProvidersService } from '../service-providers/service-providers.service';
import { SocketService } from '../sockets-gateway/service';
import { UserWalletsService } from '../user-wallets/user-wallets.service';
import { UsersService } from '../users/users.service';
import { BeetrootServicesModule } from '../beetroot-services/beetroot-services.module';
import { Chat, Message } from './entities/messaging.entity';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => SearchModule),
    forwardRef(() => HttpModule),
    forwardRef(() => UsersModule),
    forwardRef(() => ServiceProvidersModule),
    forwardRef(() => BeetrootServicesModule),
    TypeOrmModule.forFeature([
      Message,
      Chat
    ]),
  ],
  providers: [
    MessagingGateway,
    MessagingService,
    ExhibitService,
    BeetrootServicesService,
    QuestionService,
    ServiceProvidersGateway,
    ServiceProvidersService,
    SocketService,
    UsersService,
    SearchService,
    JwtService,
    UserWalletsService,
    SalesOrdersService,
  ],
  exports: [TypeOrmModule],
})
export class MessagingModule {}
