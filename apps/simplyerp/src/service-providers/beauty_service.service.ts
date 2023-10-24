import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import SearchService from '../search/search.service';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { Catalog } from './entities/catalog.entity';
import {
  ProfessionalService,
  ProfessionalServiceImage,
  ServiceProvider,
} from './entities/service-provider.entity';
import {
  BeautyService,
  BeautyProductServiceImage,
} from './entities/services.entity';
import {
  UpdateBeautyServiceDTO,
  NewProfessionalServiceDTO,
  BeautyServiceRequestDTO,
} from './dto/service.dto';

import { PlaceOrderSocketDTO, SocketAuthDTO } from '../users/dto/create-user.input';
import { ServiceProvidersService } from './service-providers.service';
import { CreateCatalogDTO } from './dto/create-catalog-dto';

@Injectable()
export class BeautyServiceService {
  constructor(
    @InjectRepository(ServiceProvider)
    private serviceProviderRepository: Repository<ServiceProvider>,
    @InjectRepository(ProfessionalService)
    private professionalServiceRepository: Repository<ProfessionalService>,

    @InjectRepository(ProfessionalServiceImage)
    private professionalServiceImageRepository: Repository<ProfessionalServiceImage>,
    @InjectRepository(Catalog)
    private catalogRepository: Repository<Catalog>,
    @InjectRepository(BeautyService)
    private beautyServiceRepository: Repository<BeautyService>,
    @InjectRepository(BeautyProductServiceImage)
    private beautyProductServiceImageRepository: Repository<BeautyProductServiceImage>,


    private readonly usersService: UsersService,
    private searchService: SearchService,
    private serviceProvidersService: ServiceProvidersService,
  ) {}
  async createNewCatelog(createCatalogDTO: CreateCatalogDTO) {
    const authenticatedUser = await this.usersService.getUserFromAuthToken(
      createCatalogDTO.authToken,
    );
    console.log(
      'authenticationService decodeUserToken user',
      authenticatedUser,
    );
    let manager: ServiceProvider;
    if (createCatalogDTO.managerUserID) {
      manager = await this.serviceProvidersService.findServiceProviderByuserId(
        createCatalogDTO.managerUserID,
      );
    } else {
      manager = await this.serviceProvidersService.findServiceProviderByuserId(
        authenticatedUser.userID,
      );
    }
    if (authenticatedUser && !manager) {
      manager = await this.serviceProvidersService.createNewServiceProvider(authenticatedUser);
    }

    const newCatalog = new Catalog();
    newCatalog.manager = manager;
    newCatalog.catalogType = createCatalogDTO.catalogType;
    newCatalog.name = createCatalogDTO.name;
    newCatalog.description = createCatalogDTO.description;
    const updatedCatelog = await this.catalogRepository.save(newCatalog);
    const createdCatelog = await this.getCatelogByID(updatedCatelog.id);

    console.log('updatedCatelog', createdCatelog);
    return {
      status: 200,
      data: JSON.stringify(createdCatelog),
      error: null,
      errorMessage: null,
      successMessage: 'success',
    };
  }
  async addBeautyService(
    newBeautyServiceDTO: BeautyServiceRequestDTO,
    files: any,
  ) {
    let catalog;
    let provider;
    const newUser = await this.usersService.decodeUserToken(
      newBeautyServiceDTO.authToken,
    );
    provider = await this.serviceProvidersService.getServiceProvideByUserID(newUser.userID);
    if(provider){

    }else{
      provider = await this.serviceProvidersService.createNewServiceProvider(newUser)
    }
    if(newBeautyServiceDTO.catalogID !== 'not_set'){
      catalog = await this.getCatelogByID(
        newBeautyServiceDTO.catalogID,
      );
    }

    if (!catalog) {
      const newCatalog = new Catalog();
      newCatalog.manager = provider;
      newCatalog.catalogType = 'general';
      newCatalog.name = 'general';
      newCatalog.description = 'general';
      const updatedCatelog = await this.catalogRepository.save(newCatalog);
      catalog = await this.getCatelogByID(updatedCatelog.id);
    }
    console.log('catalog', catalog);

    let newFiles = [];
    const beautyService = new BeautyService();
    beautyService.name = newBeautyServiceDTO.name;
    beautyService.price = newBeautyServiceDTO.price;
    beautyService.providerID = provider.id;
    beautyService.provider = provider;
    beautyService.catalogID = catalog.id;
    beautyService.catalogName = catalog.name;
    beautyService.catalog = catalog;
    beautyService.tradeStatus = 'new';
    beautyService.description = newBeautyServiceDTO.description;
    if (files) {
      await Promise.all(
        files.map(async (file: LocalFileDto) => {
          const image = {
            path: file.path,
            filename: file.filename,
            mimetype: file.mimetype,
          };
          const newImageSchema =
            await this.beautyProductServiceImageRepository.create(image);
          const newFile = await this.beautyProductServiceImageRepository.save(
            newImageSchema,
          );
          newFiles.push(newFile);
        }),
      );
      beautyService.images = newFiles;

      console.log('newFiles', newFiles);
      beautyService.images = newFiles;
    }

    const updatedBeautyService =
      await this.beautyServiceRepository.save(beautyService);
    console.log(
      'updatedBeautyService',
      updatedBeautyService.id,
      updatedBeautyService,
    );
    const service = await this.getBeautyServiceByID(
      updatedBeautyService.id,
    );
    // }
    console.log('BeautyService', service);
    const indexed = await this.searchService.indexBeautyService(service);
    console.log('indexed', indexed);

    return {
      status: 200,
      data: JSON.stringify(service),
      error: null,
      errorMessage: null,
      successMessage: 'success',
    };
  }
  async updateBeautyService(
    beautyServiceRequestDTO: UpdateBeautyServiceDTO,
    files: any,
  ) {
    const oldService = await this.getBeautyServiceByID(
      beautyServiceRequestDTO.id,
    );
    let newFiles = [];

    oldService.name = beautyServiceRequestDTO.name;
    oldService.category = beautyServiceRequestDTO.category;
    oldService.price = beautyServiceRequestDTO.price;
    (oldService.orders = oldService.orders),
      (oldService.tradeStatus = beautyServiceRequestDTO.tradeStatus),
      (oldService.description = beautyServiceRequestDTO.description),
      await Promise.all(
        files.map(async (file: LocalFileDto) => {
          const image = {
            path: file.path,
            filename: file.filename,
            mimetype: file.mimetype,
          };
          const newImageSchema =
            await this.beautyProductServiceImageRepository.create(image);
          const newFile = await this.beautyProductServiceImageRepository.save(
            newImageSchema,
          );
          newFiles.push(newFile);
        }),
      );
    oldService.images = newFiles;

    console.log('newFiles', newFiles);
    oldService.images = newFiles;
    const updatedBeautyService = await this.beautyServiceRepository.update(
      oldService.id,
      oldService,
    );
    const service = await this.getBeautyServiceByID(oldService.id);
    // }
    console.log('updatedBeautyService', service);
    const indexed = await this.searchService.indexBeautyService(service);
    console.log('indexed', indexed);

    return {
      status: 200,
      data: JSON.stringify(service),
      error: null,
      errorMessage: null,
      successMessage: 'success',
    };
  }



  async getCatelogByID(id: string): Promise<Catalog> {

    const queryBuilder = this.catalogRepository.createQueryBuilder('catalog');
    queryBuilder.leftJoinAndSelect('catalog.manager', 'manager');
    queryBuilder.leftJoinAndSelect('manager.user', 'user');
    queryBuilder.leftJoinAndSelect('catalog.services', 'services');
    queryBuilder.leftJoinAndSelect('catalog.products', 'products');
    queryBuilder.where('catalog.id = :id', { id });

    const catalog = await queryBuilder.getOne();

    if (!catalog || catalog === null) {
      return null;

      // throw new NotFoundException(`User with ${email} not found`);
    }
    return catalog;
  }

  async getCatelogsByAccountID(accountID: string): Promise<Catalog[]> {
    console.log('getCatelogsByAccountID acc id', accountID);
    if (accountID) {
     
      const queryBuilder = this.catalogRepository.createQueryBuilder('catalog');
      queryBuilder.leftJoinAndSelect('catalog.manager', 'manager');
      queryBuilder.leftJoinAndSelect('manager.user', 'user');
      queryBuilder.leftJoinAndSelect('catalog.products', 'products');
      queryBuilder.leftJoinAndSelect('products.images', 'product_images');
      queryBuilder.leftJoinAndSelect('catalog.services', 'services');
      queryBuilder.leftJoinAndSelect('services.images', 'images');
      queryBuilder.where('user.userID = :accountID', { accountID });
      const catalogs = await queryBuilder.getMany();

      if (!catalogs || catalogs === null) {
        return null;
        // throw new NotFoundException(`User with ${email} not found`);
      }
      console.log('catalogs', catalogs);
      return catalogs;
    }
  }

  async getBeautyServiceProviders(
    accountID: string,
  ): Promise<ServiceProvider[]> {
    console.log('catalogs acc id', accountID);
    if (accountID) {
     
      const queryBuilder =
        this.serviceProviderRepository.createQueryBuilder('serviceProvider');
      // Join with the Customer and Vendor relations
      queryBuilder
        .leftJoinAndSelect('serviceProvider.user', 'user')
        // .leftJoinAndSelect('serviceProvider.orders', 'orders')
        .leftJoinAndSelect('serviceProvider.catalogs', 'catalogs')
        .leftJoinAndSelect('catalogs.services', 'services')
        .leftJoinAndSelect('services.images', 'images')
        .leftJoinAndSelect('services.orders', 'orders');

      const services = await queryBuilder.getMany();

      if (!services || services === null) {
        return null;
        // throw new NotFoundException(`User with ${email} not found`);
      }
      return services;
    }
  }

  async getBeautyServiceByProviderID(id: string): Promise<BeautyService> {
    const queryBuilder =
      this.beautyServiceRepository.createQueryBuilder('service');
    queryBuilder.leftJoinAndSelect('service.orders', 'orders');
    queryBuilder.leftJoinAndSelect('service.images', 'images');
    queryBuilder.leftJoinAndSelect('service.catalog', 'catalog');
    queryBuilder.leftJoinAndSelect('catalog.manager', 'manager');
    queryBuilder.leftJoinAndSelect('manager.user', 'user');
    queryBuilder.where('manager.id = :id', { id });
    const service = await queryBuilder.getOne();

    if (!service || service === null) {
      return null;
      // throw new NotFoundException(`User with ${email} not found`);
    }
    return service;
  }

  async getBeautyServiceByID(id: string): Promise<BeautyService> {
    const queryBuilder =
      this.beautyServiceRepository.createQueryBuilder('service');
    queryBuilder.leftJoinAndSelect('service.orders', 'orders');
    queryBuilder.leftJoinAndSelect('service.images', 'images');
    queryBuilder.leftJoinAndSelect('service.catalog', 'catalog');
    queryBuilder.leftJoinAndSelect('catalog.manager', 'manager');
    queryBuilder.leftJoinAndSelect('manager.user', 'user');
    queryBuilder.where('service.id = :id', { id });
    const service = await queryBuilder.getOne();

    if (!service || service === null) {
      return null;
      // throw new NotFoundException(`User with ${email} not found`);
    }
    return service;
  }


  async getProfessionalServiceByID(id: string): Promise<ProfessionalService> {
    console.log('getProfessionalServiceByID', id);
    const service = await this.professionalServiceRepository.findOne({
      where: { id: id },
      relations: { catalog: true, provider: true },
    });
    if (!service || service === null) {
      return null;
      // throw new NotFoundException(`User with ${email} not found`);
    }
    return service;
  }

  async getAccountCatelog(accountID: string) {
    // console.log('Through Sockets Get-account-catalogs', accountID);
    const accountCatalogs = await this.getCatelogsByAccountID(accountID);
    if (accountCatalogs) {
      const successData = {
        status: 200,
        data: JSON.stringify(accountCatalogs),
        error: null,
        errorMessage: null,
        successMessage: 'success',
      };
      // console.log('getAccountCatelog successData', successData)

      return successData;
    }
  }

  async  requestBookingOrder(orderDTO: SocketAuthDTO) {
    let orderRequest = JSON.parse(orderDTO.order)
    let orderRequestOrderType = orderRequest['orderType']
    let orderRequestClientID = orderRequest['clientID']
    let orderRequestProviderID = orderRequest['providerID']
    let orderRequestCommodity = orderRequest['commodity']
    console.log('requestBookingOrder data', orderRequestCommodity['id'])
    let requestOrder: PlaceOrderSocketDTO = {
      orderID: '',
      commodityID: orderRequestCommodity['id'],
      commodityWeight: orderRequestCommodity['commodityWeight'],
      orderType: orderRequestOrderType,
      clientID: orderRequestClientID,
      providerID: orderRequestProviderID,
      clientAuth: '',
      orderLines: [],
      order: ''
    }
    // const order = await this.salesOrdersService.requestWarehouseService(requestOrder)
    return 'order';
  }
}
