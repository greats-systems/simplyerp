import { Module, forwardRef } from '@nestjs/common';
import { BeetrootServicesService } from './beetroot-services.service';
import { BeetrootServicesGateway } from './beetroot-services.gateway';
import { JwtService } from '@nestjs/jwt';
import { SalesOrdersService } from '../sales-orders/sales-orders.service';
// import SearchService from '../search/search.service';
import { ServiceProvidersGateway } from '../service-providers/service-providers.gateway';
import { ServiceProvidersService } from '../service-providers/service-providers.service';
import { SocketService } from '../sockets-gateway/service';
import { UserWalletsService } from '../user-wallets/user-wallets.service';
import { UsersService } from '../users/users.service';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../common/auth.module';
// import { SearchModule } from '../search/search.module';
import { ServiceProvidersModule } from '../service-providers/service-providers.module';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExhibitService } from './exhibit-service';
import { ExhibitImage, Question, Questionnaire, QuestionnaireSection } from './entities/questionaire.entity';
import { QuestionService } from './question-service';
import { Editor } from './entities/beetroot-service.entity';
import { Exhibit, Dialogue, QuestionAnswer, Responses } from './entities/exhibit.entity';
import { BeetrootServicesController } from './beetroot-services.controller';
import { MigrationService } from './migration-service';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    // forwardRef(() => SearchModule),
    forwardRef(() => HttpModule),
    forwardRef(() => UsersModule),
    forwardRef(() => ServiceProvidersModule),
    TypeOrmModule.forFeature([
      Questionnaire,
      QuestionnaireSection,
      Question,
      Exhibit,
      Dialogue,
      Editor,
      ExhibitImage,
      QuestionAnswer, 
      Responses
    ]),
  ],
  controllers: [
    BeetrootServicesController
  ],
  exports: [TypeOrmModule],
  providers: [
    BeetrootServicesGateway,
    BeetrootServicesService,
    ExhibitService,
    QuestionService,
    ServiceProvidersGateway,
    ServiceProvidersService,
    SocketService,
    UsersService,
    // SearchService,
    MigrationService,
    JwtService,
    UserWalletsService,
    SalesOrdersService,
  ],
})
export class BeetrootServicesModule {}
