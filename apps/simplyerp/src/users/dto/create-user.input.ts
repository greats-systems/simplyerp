import { ApiProperty } from "@nestjs/swagger";
import { Socket } from "socket.io";

export class CreateUserDTO {
  @ApiProperty({})
  authToken: string
  @ApiProperty({})
  firstName?: string;
  @ApiProperty({})
  lastName?: string;
  @ApiProperty({})
  password?: string;
  @ApiProperty({})
  gender?: string;
  @ApiProperty({})
  phone: string;
  @ApiProperty({})
  email: string;
  @ApiProperty({})
  neighbourhood?: string;
  @ApiProperty({})
  city: string;
  @ApiProperty({})
  country?: string;
  @ApiProperty({})
  role: string;
  @ApiProperty({})
  accountType: string;
  @ApiProperty({})
  specialization: string;
  @ApiProperty({})
  searchTerm: string;
  @ApiProperty({})
  tradingAs: string;
  @ApiProperty({})
  salary: string;
  @ApiProperty({})
  department: string;
  @ApiProperty({})
  jobRole: string;
  @ApiProperty({})
  deploymentStatus: string;
  @ApiProperty({})
  streetAddress: string;
}                  


export class SocketPayloadDTO {
  clientAuth: string;
  status: string;
  payload: string
  bookingType: string;
  providerID: string;
  clientID: string;
}
export class SocketAuthDTO {
  clientAuth: string;
  status: string;
  order: string
  bookingType: string;
  providerID: string;
  clientID: string;
}

export class PlaceOrderSocketDTO {
  clientAuth: string;
  orderID: string;
  commodityID: string;
  commodityWeight: string;
  orderType: string;
  clientID: string;
  providerID: string;
  orderLines: PlaceBiddingOrderLineDTO[];
  order: string
}

export class SocketCallDTO {
  socket: Socket;
  clientAuth: string;
  data: string;
  service: string; 
  payload: string;
}

export class PlaceBiddingOrderDTO {
  providerID: string;
  orderType: string;
  bidderID: string;
  orderLines: PlaceBiddingOrderLineDTO[];
}
export class PlaceBiddingOrderLineDTO {
  orderID: string;
  offerItemID: string;
  weight: number;
  amount: number;
  quantity: number;
  vat: number;
  discount: number;
}