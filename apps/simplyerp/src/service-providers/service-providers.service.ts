import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Vehicle,
  VehicleImage,
} from '../service-providers/entities/logistics.entity';
// import SearchService from '../search/search.service';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { Catalog } from './entities/catalog.entity';
import {
  Employee,
  ProfessionalService,
  ProfessionalServiceImage,
  ServiceProvider,
} from './entities/service-provider.entity';
import {
  BeautyProduct,
  BeautyService,
  BeautyProductServiceImage,
} from './entities/services.entity';
import { VehicleDTO } from '../sales-orders/dto/vehicle.dto';
import { User } from '../users/entities/user.entity';
import { CreatePortfolioDTO, CreateCatalogDTO } from './dto/create-catalog-dto';
import {
  UpdateBeautyServiceDTO,
  BeautyServiceRequestDTO,
  NewProfessionalServiceDTO,
} from './dto/service.dto';

import { CreateFirebaseAuthUserDTO } from './dto/firebase-account.dto';
import { UpdateServiceProviderProfileDTO } from './dto/update-service-provider';
import { SalesOrdersService } from '../sales-orders/sales-orders.service';
import { PlaceOrderSocketDTO, SocketAuthDTO } from '../users/dto/create-user.input';

@Injectable()
export class ServiceProvidersService {
  constructor(
    @InjectRepository(ProfessionalService)
    private professionalServiceRepository: Repository<ProfessionalService>,

    @InjectRepository(ProfessionalServiceImage)
    private professionalServiceImageRepository: Repository<ProfessionalServiceImage>,

    @InjectRepository(ServiceProvider)
    private serviceProviderRepository: Repository<ServiceProvider>,
    @InjectRepository(Catalog)
    private catalogRepository: Repository<Catalog>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(BeautyProduct)
    private beautyProductRepository: Repository<BeautyProduct>,

    @InjectRepository(BeautyService)
    private beautyServiceRepository: Repository<BeautyService>,

    @InjectRepository(BeautyProductServiceImage)
    private beautyProductServiceImageRepository: Repository<BeautyProductServiceImage>,

    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,

    @InjectRepository(VehicleImage)
    private VehicleImageRepository: Repository<VehicleImage>,

    private readonly usersService: UsersService,
    // private searchService: SearchService,
    private salesOrdersService: SalesOrdersService,
  ) {}
  
  async fetchProviderAccountByID(
    id: string,
  ): Promise<ServiceProvider> {
    const queryBuilder =
      this.serviceProviderRepository.createQueryBuilder('serviceProvider');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('serviceProvider.user', 'user')
      .leftJoinAndSelect('serviceProvider.orders', 'orders')
      .leftJoinAndSelect('serviceProvider.services', 'services')
      .leftJoinAndSelect('serviceProvider.catalogs', 'catalogs');

    // Use OR to match either customer or provider userID
    queryBuilder.where('serviceProvider.id = :id', {
      id,
    });

    // Execute the query and return the results
    const serviceProvider = await queryBuilder.getOne();

    console.log('@serviceProvider', serviceProvider);
    return serviceProvider;
  }
  async fetchProviderAccountByAdminID(
    adminUserID: string,
  ): Promise<ServiceProvider> {
    const queryBuilder =
      this.serviceProviderRepository.createQueryBuilder('serviceProvider');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('serviceProvider.user', 'user')
      .leftJoinAndSelect('serviceProvider.orders', 'orders')
      .leftJoinAndSelect('serviceProvider.services', 'services')
      .leftJoinAndSelect('serviceProvider.catalogs', 'catalogs');

    // Use OR to match either customer or provider userID
    queryBuilder.where('serviceProvider.adminUserID = :adminUserID', {
      adminUserID,
    });

    // Execute the query and return the results
    const serviceProvider = await queryBuilder.getOne();

    // console.log('@getAccount serviceProvider', serviceProvider);
    return serviceProvider;
  }
  async findServiceProviderAccountByFirebaseAuthID(
    firebaseAuthUser: CreateFirebaseAuthUserDTO,
  ): Promise<any> {
    let user: User;
    user = await this.usersService.fetchUserDataByFirebaseAuthID(
      firebaseAuthUser.uid,
    );
    if (!user) {
      user = await this.usersService.registerFirebaseUser(firebaseAuthUser);
    }
    if (user) {
      const preFetchProvider = await this.serviceProviderRepository.findOne({
        where: {
          adminUserID: user.userID,
        },
      });

      if (!preFetchProvider) {
        const newProvider = new ServiceProvider();
        newProvider.user = user;
        newProvider.adminUserID = user.userID;
        newProvider.accountType = user.accountType;
        await this.serviceProviderRepository.save(newProvider);
      }
      if (user) {
        let loggedUser = await this.usersService.generateUserCredentials(user)
        const serviceProvider = await this.fetchProviderAccountByAdminID(
          user.userID,
        );
        console.log('loggedUser', loggedUser)
        console.log('serviceProvider', serviceProvider)
        serviceProvider['token']= loggedUser.access_token
        const successData = {
          status: 200,
          data: JSON.stringify({ ...serviceProvider, token: loggedUser.access_token }),
          error: null,
          errorMessage: null,
          successMessage: 'success',
        };
        return successData;

      }
      return;
      
    }
  }

  async updateServiceProviderProfileByID(
    updateServiceProviderProfile: UpdateServiceProviderProfileDTO,
  ) {
    let user: User;
    let provider: ServiceProvider;
    user = await this.usersService.fetchUserDataByFirebaseAuthID(
      updateServiceProviderProfile.uid,
    );
    if (user) {
      provider = await this.serviceProviderRepository.findOne({
        where: {
          adminUserID: user.userID,
        },
      });
      if (!provider) {
        const newProvider = new ServiceProvider();
        newProvider.user = user;
        newProvider.adminUserID = user.userID;
        newProvider.accountType = user.accountType;
        newProvider.specialization = user.specialization;
        newProvider.motto = updateServiceProviderProfile.motto;
        await this.serviceProviderRepository.save(newProvider);
        provider = await this.serviceProviderRepository.findOne({
          where: {
            adminUserID: user.userID,
          },
        });
      }
      if (provider) {
        try {
          provider.tradingName = updateServiceProviderProfile.tradingName;
          provider.serviceType = updateServiceProviderProfile.serviceType;
          provider.shortTermGoals = updateServiceProviderProfile.shortTermGoals;
          provider.longTermGoals = updateServiceProviderProfile.longTermGoals;
          provider.specialization = updateServiceProviderProfile.specialization;
          provider.businessStage = updateServiceProviderProfile.businessStage;
          provider.businessRegistrationNumber =
            updateServiceProviderProfile.businessRegistrationNumber;
          provider.businessDescription =
            updateServiceProviderProfile.businessDescription;
          provider.phone = updateServiceProviderProfile.phone;
          provider.email = updateServiceProviderProfile.email;
          provider.city = updateServiceProviderProfile.city;
          provider.country = updateServiceProviderProfile.country;
          provider.streetAddress = updateServiceProviderProfile.streetAddress;
          provider.portfolioUrl = updateServiceProviderProfile.portfolioUrl;
          provider.facebookUrl = updateServiceProviderProfile.facebookUrl;
          provider.xUrl = updateServiceProviderProfile.xUrl;
          provider.linkedInUrl = updateServiceProviderProfile.linkedInUrl;
          provider.instagramUrl = updateServiceProviderProfile.instagramUrl;
          provider.motto = updateServiceProviderProfile.motto;
          await this.serviceProviderRepository.update(provider.id, provider);
        } catch (error) {
          console.log('error', error)
        }
      }
      const serviceProvider = await this.fetchProviderAccountByAdminID(
        user.userID,
      );
      return serviceProvider;
    }
  }



  async createNewServiceProvider(user: User) {
    try {
      if (user) {
        const provider = new ServiceProvider();
        provider.user = user;
        provider.accountType = user.accountType;
        provider.serviceType = user.tradingAs;
        provider.tradingName = user.lastName + user.userID.substring(0, 8);
        const newProvider = await this.serviceProviderRepository.save(provider);
        return newProvider;
      }
      return null;
    } catch (error) {}
  }
  async updateService(service: BeautyService) {
    try {
      if (service) {
        service.providerID = service.catalog.manager.id;
        const updatedService = await this.beautyServiceRepository.update(
          service.id,
          service,
        );
        console.log('updated service', updatedService);
        return updatedService;
      }
      return null;
    } catch (error) {}
  }

  async createServiceProvider(user: User) {
    try {
      if (user) {
        const provider = new ServiceProvider();
        provider.user = user;
        provider.accountType = user.accountType;
        provider.serviceType = user.tradingAs;
        provider.tradingName = user.lastName + user.userID.substring(0, 8);
        const newProvider = await this.serviceProviderRepository.save(provider);
        return newProvider;
      }
      return null;
    } catch (error) {}
  }
  async getServiceProvideByUserID(userID: string): Promise<ServiceProvider> {
    const queryBuilder =
      this.serviceProviderRepository.createQueryBuilder('provider');
    queryBuilder.leftJoinAndSelect('provider.user', 'user');
    queryBuilder.leftJoinAndSelect('provider.catalogs', 'catalogs');
    queryBuilder.leftJoinAndSelect('catalogs.services', 'services');
    queryBuilder.leftJoinAndSelect('services.images', 'images');
    queryBuilder.where('user.userID = :userID', { userID });
    const provider = await queryBuilder.getOne();

    if (!provider || provider === null) {
      return null;
      // throw new NotFoundException(`User with ${email} not found`);
    }
    return provider;
  }
  async getServiceProvideByID(id: string): Promise<ServiceProvider> {
    const queryBuilder =
      this.serviceProviderRepository.createQueryBuilder('provider');
    queryBuilder.leftJoinAndSelect('provider.user', 'user');
    queryBuilder.leftJoinAndSelect('provider.catalogs', 'catalogs');
    queryBuilder.leftJoinAndSelect('catalogs.services', 'services');
    queryBuilder.leftJoinAndSelect('services.images', 'images');
    queryBuilder.where('provider.id = :id', { id });
    const provider = await queryBuilder.getOne();

    if (!provider || provider === null) {
      return null;
      // throw new NotFoundException(`User with ${email} not found`);
    }
    return provider;
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
    // const indexed = await this.searchService.indexBeautyService(service);
    // console.log('indexed', indexed);

    return {
      status: 200,
      data: JSON.stringify(service),
      error: null,
      errorMessage: null,
      successMessage: 'success',
    };
  }
  async createNewProfessionalService(
    newProfessionalServiceDTO: NewProfessionalServiceDTO,
    files: any,
  ) {
    let catalog;
    const newUser = await this.usersService.decodeUserToken(
      newProfessionalServiceDTO.authToken,
    );
    catalog = await this.getCatelogByID(
      newProfessionalServiceDTO.catalogID,
    );
    const provider = await this.getServiceProvideByID(newProfessionalServiceDTO.providerID);
    console.log('provider', provider);
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
    const professionalService = new ProfessionalService();
    professionalService.name = newProfessionalServiceDTO.name;
    professionalService.price = newProfessionalServiceDTO.price;
    professionalService.providerID = provider.id;
    professionalService.provider = provider;
    professionalService.catalogID = catalog.id;
    professionalService.catalogName = catalog.name;
    professionalService.catalog = catalog;
    professionalService.tradeStatus = 'new';
    professionalService.description = newProfessionalServiceDTO.description;
    if (files) {
      await Promise.all(
        files.map(async (file: LocalFileDto) => {
          const image = {
            path: file.path,
            filename: file.filename,
            mimetype: file.mimetype,
          };
          const newImageSchema =
            await this.professionalServiceImageRepository.create(image);
          const newFile = await this.professionalServiceImageRepository.save(
            newImageSchema,
          );
          newFiles.push(newFile);
        }),
      );
      professionalService.images = newFiles;

      console.log('newFiles', newFiles);
      professionalService.images = newFiles;
    }

    const updatedProfessionalService =
      await this.professionalServiceRepository.save(professionalService);
    console.log(
      'updatedProfessionalService',
      updatedProfessionalService.id,
      updatedProfessionalService,
    );
    const service = await this.getProfessionalServiceByID(
      updatedProfessionalService.id,
    );
    // }
    console.log('ProfessionalService', service);
    // const indexed = await this.searchService.indexProfessionalService(service);
    // console.log('indexed', indexed);

    return {
      status: 200,
      data: JSON.stringify(service),
      error: null,
      errorMessage: null,
      successMessage: 'success',
    };
  }


  async addNewVehicle(vehicleDTO: VehicleDTO, files: any) {
    const newUser = await this.usersService.decodeUserToken(
      vehicleDTO.authToken,
    );
    const provider = await this.usersService.findOneByUserID(newUser.userID);
    // console.log('authenticationService.decodeUserToken provider', provider)
    let newFiles = [];
    const newVehicle = new Vehicle();
    (newVehicle.vehicleClass = vehicleDTO.vehicleClass),
      (newVehicle.manufacturer = vehicleDTO.manufacturer),
      (newVehicle.carryingWeightMax = vehicleDTO.carryingWeightMax),
      (newVehicle.carryingWeightMin = vehicleDTO.carryingWeightMin),
      (newVehicle.engineNumber = vehicleDTO.engineNumber),
      (newVehicle.gvtRegNumber = vehicleDTO.gvtRegNumber),
      (newVehicle.description = vehicleDTO.description),
      await Promise.all(
        files.map(async (file: LocalFileDto) => {
          const image = {
            path: file.path,
            filename: file.filename,
            mimetype: file.mimetype,
            // offerItem: newOfferItem
          };
          const newImageSchema = await this.VehicleImageRepository.create(
            image,
          );
          const newFile = await this.VehicleImageRepository.save(
            newImageSchema,
          );

          newFiles.push(newFile);
        }),
      );

    console.log('newFiles', newFiles);
    newVehicle.images = newFiles;
    const updatedVehicle = await this.vehicleRepository.save(newVehicle);
    const vehicle = await this.getVehicleByID(updatedVehicle.vehicleID);
    console.log('updatedVehicle', vehicle);

    // }
    return {
      status: 200,
      data: JSON.stringify(vehicle),
      error: null,
      errorMessage: null,
      successMessage: 'success',
    };
  }

  async getVehicleByID(vehicleID: string) {
    const vehicle = await this.vehicleRepository.findOne({
      where: { vehicleID: vehicleID },
      relations: { images: true, orders: true },
    });
    if (!vehicle) {
      return null;
    } else {
      return vehicle;
    }
  }

  async findVehiclesByProviderId(userID: string): Promise<Vehicle[]> {
    const queryBuilder = this.vehicleRepository.createQueryBuilder('vehicle');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('vehicle.provider', 'provider')
      .leftJoinAndSelect('vehicle.orders', 'orders')
      .leftJoinAndSelect('vehicle.images', 'images');

    // Use OR to match either customer or provider userID
    queryBuilder.where('provider.userID = :userID', { userID });

    // Execute the query and return the results
    const vehicles = await queryBuilder.getMany();
    // console.log('@getAccount vehicles', vehicles)
    return vehicles;
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

  async searchBeautyServiceProviders(ids: any): Promise<ServiceProvider[]> {
    console.log('searchBeautyServiceProviders ids', ids);
    const queryBuilder =
      this.serviceProviderRepository.createQueryBuilder('serviceProvider');
    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('serviceProvider.user', 'user')
      // .leftJoinAndSelect('serviceProvider.orders', 'orders')
      .leftJoinAndSelect('serviceProvider.catalogs', 'catalogs')
      .leftJoinAndSelect('catalogs.services', 'services')
      .leftJoinAndSelect('services.images', 'images')
      .leftJoinAndSelect('services.orders', 'orders')
      .where('serviceProvider.id IN (:...ids)', { ids });
    const services = await queryBuilder.getMany();
    console.log('searchBeautyServiceProviders services', services);

    if (!services || services === null) {
      return null;
      // throw new NotFoundException(`User with ${email} not found`);
    }
    return services;
  }

  async getAllWarehouseServiceProviders(): Promise<ServiceProvider[]> {
    console.log('get All Warehouse Service Providers',)
    const queryBuilder =
      this.serviceProviderRepository.createQueryBuilder('serviceProvider');
    // Join with the Customer and Vendor relations
    const serviceType = 'warehouse_services'
    queryBuilder
      .leftJoinAndSelect('serviceProvider.user', 'user')
      // .leftJoinAndSelect('serviceProvider.orders', 'orders')
      .leftJoinAndSelect('serviceProvider.catalogs', 'catalogs')
      .leftJoinAndSelect('catalogs.services', 'services')
      .leftJoinAndSelect('services.images', 'images')
      .leftJoinAndSelect('services.orders', 'orders');
    // Use OR to match either customer or provider userID
    queryBuilder.where('serviceProvider.serviceType = :serviceType', {serviceType});
    const services = await queryBuilder.getMany();

    if (!services || services === null) {
      return null;
      // throw new NotFoundException(`User with ${email} not found`);
    }
    return services;
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
  async findServiceProviderByuserId(userID: string): Promise<ServiceProvider> {
    const queryBuilder =
      this.serviceProviderRepository.createQueryBuilder('serviceProvider');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('serviceProvider.user', 'user')
      .leftJoinAndSelect('serviceProvider.orders', 'orders')
      .leftJoinAndSelect('serviceProvider.services', 'services')
      .leftJoinAndSelect('serviceProvider.catalogs', 'catalogs');

    // Use OR to match either customer or provider userID
    queryBuilder.where('user.userID = :userID', { userID });

    // Execute the query and return the results
    const serviceProvider = await queryBuilder.getOne();
    return serviceProvider;
  }
  async getBeautyServices(accountID: string): Promise<BeautyService[]> {
    console.log('catalogs acc id', accountID);
    if (accountID) {
     
      const queryBuilder =
        this.beautyServiceRepository.createQueryBuilder('service');
      queryBuilder.leftJoinAndSelect('service.orders', 'orders');
      queryBuilder.leftJoinAndSelect('service.images', 'images');
      queryBuilder.leftJoinAndSelect('service.catalog', 'catalog');
      queryBuilder.leftJoinAndSelect('catalog.manager', 'manager');
      queryBuilder.leftJoinAndSelect('manager.user', 'user');
      queryBuilder.leftJoinAndSelect('catalog.services', 'services');
      queryBuilder.leftJoinAndSelect('catalog.products', 'products');
      // queryBuilder.where('user.userID = :accountID', {accountID});

      const services = await queryBuilder.getMany();

      if (!services || services === null) {
        return null;
        // throw new NotFoundException(`User with ${email} not found`);
      }
      services.map(async (service) => {
        if (service.providerID === null) {
          await this.updateService(service);
        }
      });

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

  async getBeautyProductByID(id: string): Promise<BeautyProduct> {
    const product = await this.beautyProductRepository.findOne({
      where: { id: id },
      relations: {
        catalog: true,
        images: true,
      },
    });
    if (!product || product === null) {
      return null;
      // throw new NotFoundException(`User with ${email} not found`);
    }
    return product;
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
  async findEmployeesByEmployeerId(userID: string): Promise<Employee[]> {
    const queryBuilder = this.employeeRepository.createQueryBuilder('employee');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('employee.employeer', 'employeer')
      // .leftJoinAndSelect('employee.business', 'business')
      .leftJoinAndSelect('employee.profile', 'profile');
    // .leftJoinAndSelect(
    //   'employee.performedAssignments',
    //   'performedAssignments',
    // );

    // Use OR to match either customer or provider userID
    queryBuilder.where('employeer.userID = :userID', { userID });

    // Execute the query and return the results
    const employees = await queryBuilder.getMany();
    // console.log('@getAccount employees', employees)
    return employees;
  }

  async findEmployeeByEmployeerId(userID: string): Promise<Employee> {
    const queryBuilder = this.employeeRepository.createQueryBuilder('employee');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('employee.employeer', 'employer')
      // .leftJoinAndSelect('employee.business', 'business')
      .leftJoinAndSelect('employee.profile', 'profile');
    // .leftJoinAndSelect(
    //   'employee.performedAssignments',
    //   'performedAssignments',
    // );

    // Use OR to match either customer or provider userID
    queryBuilder.where('employer.userID = :userID', { userID });

    // Execute the query and return the results
    const employee = await queryBuilder.getOne();
    // console.log('@getAccount employee', employee)
    return employee;
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
