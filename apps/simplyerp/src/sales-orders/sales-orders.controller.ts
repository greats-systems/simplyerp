import { Controller, Post, Body } from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';


@Controller('order')
export class SalesOrdersController {
  constructor(
    private readonly orderService: SalesOrdersService,
    ) {}

  // getAccountOrders
  @Post('get-all-account-orders')
getAccountOrders(@Body() requestToTradeCommodityDTO: any) {
  console.log('getAccountOrders')
  console.log(requestToTradeCommodityDTO)
  return this.orderService.findOrdersByCustomerOrVendorId(requestToTradeCommodityDTO.userID);
}
// get-all-account-orders
@Post('get-all-account-orders-by-status')
getAllAccountOrdersByStatus(@Body() requestToTradeCommodityDTO: any) {
  console.log('requestToTradeCommodityDTO')
  console.log(requestToTradeCommodityDTO)
  return this.orderService.getAllAccountOrdersByStatus(requestToTradeCommodityDTO);
}

}
