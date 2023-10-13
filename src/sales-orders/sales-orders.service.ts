import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlaceOrderSocketDTO } from 'src/users/dto/create-user.input';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Order, OrderLine } from './entities/order.entity';
import { ServiceProvider } from 'src/service-providers/entities/service-provider.entity';

@Injectable()
export class SalesOrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderLine)
    private readonly orderLineRepository: Repository<OrderLine>,
    @InjectRepository(ServiceProvider)
    private serviceProviderRepository: Repository<ServiceProvider>,
    private readonly usersService: UsersService, 

  ) { }

  async getAllAccountOrdersByStatus(request: any) {
    console.log('getOrdersByAccountIDAndServiceInRequestStatus Request')
    // console.log(request)
    const orders = await this.orderRepository.find(
      { where: { customer: request.servingAccountID, id: request.servingStatus, updatedStatus: 'false' } })

    // console.log('orders')
    // console.log(orders)
    return { status: 200, data: { orders }, err: null }
  }
  async findOrderByCustomerOrVendorId(userID: string): Promise<Order> {
    const queryBuilder = this.orderRepository.createQueryBuilder('order');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.provider', 'provider')
      .leftJoinAndSelect('order.offerItem', 'offerItem')
      .leftJoinAndSelect('offerItem.images', 'images');

    // Use OR to match either customer or provider userID
    queryBuilder.where('customer.userID = :userID OR provider.userID = :userID', { userID });

    // Execute the query and return the results
    const order = await queryBuilder.getOne();
    // console.log('@getAccountOrders orders', order)
    return order;
  }
  async findOrderByID(id: string): Promise<Order> {
    const queryBuilder = this.orderRepository.createQueryBuilder('order');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.provider', 'provider')
      .leftJoinAndSelect('provider.user', 'user')
      .leftJoinAndSelect('order.orderLines', 'orderLines')
      .leftJoinAndSelect('orderLines.service', 'service')
      .leftJoinAndSelect('service.images', 'images');

    // Use OR to match either customer or provider id
    queryBuilder.where('order.id = :id', { id });

    // Execute the query and return the results
    const orders = await queryBuilder.getOne();
    // console.log('@getAccountOrders orders', orders)
    return orders;
  }
  async findOrdersByCustomerOrVendorId(userID: string): Promise<Order[]> {
    const queryBuilder = this.orderRepository.createQueryBuilder('order');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.provider', 'provider')
      .leftJoinAndSelect('provider.user', 'user')
      .leftJoinAndSelect('order.orderLines', 'orderLines')
      .leftJoinAndSelect('orderLines.service', 'service')
      .leftJoinAndSelect('service.images', 'images');

    // Use OR to match either customer or provider userID
    queryBuilder.where('customer.userID = :userID OR user.userID = :userID', { userID });

    // Execute the query and return the results
    const orders = await queryBuilder.getMany();
    // console.log('@getAccountOrders orders', orders)
    return orders;
  }



    // QUIRIES
    async fetchProviderAccountByID(
      userID: string,
    ): Promise<ServiceProvider> {
      console.log('fetch Provider by userID',userID)
      const queryBuilder =
        this.serviceProviderRepository.createQueryBuilder('serviceProvider');
      // Join with the Customer and Vendor relations
      queryBuilder
        .leftJoinAndSelect('serviceProvider.user', 'user')
        // .leftJoinAndSelect('serviceProvider.orders', 'orders')
        .leftJoinAndSelect('serviceProvider.services', 'services')
        .leftJoinAndSelect('serviceProvider.catalogs', 'catalogs');
      // Use OR to match either customer or provider userID
      queryBuilder.where('user.userID = :userID', {
        userID,
      });
  
      // Execute the query and return the results
      const serviceProvider = await queryBuilder.getOne();
  
      console.log('@serviceProvider', serviceProvider);
      return serviceProvider;
    }
}
