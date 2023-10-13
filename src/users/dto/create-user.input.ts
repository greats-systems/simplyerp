import { Socket } from "socket.io";

export class CreateUserDTO {
  authToken: string
  firstName?: string;
  lastName?: string;
  password?: string;
  phone: string;
  neighbourhood?: string;
  city: string;
  role: string;
  accountType: string;
  specialization: string;
  searchTerm: string;
  tradingAs: string;
  salary: string;
  department: string;
  jobRole: string;
  deploymentStatus: string;
  streetAddress: string;
}                  

export class chatDTO {
  clientAuth: string;
  content: string;
  senderID: string;
  recieverID: string;
  senderPhone: string;
  recieverPhone: string;
  status: string;
}

export class MessageDTO {
  socketID: string;
  clientAuth: string;
  textContent: string;
  mediaContent: any;
  senderID: string;
  recieverID: string;
  senderPhone: string;
  recieverPhone: string;
  status: string;
  time: any;
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