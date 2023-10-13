import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, WebSocketServer } from '@nestjs/websockets';
import { SalesOrdersService } from './sales-orders.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { Server, Socket } from 'socket.io';
import { SocketCallDTO } from 'src/users/dto/create-user.input';
import { SocketService } from 'src/sockets-gateway/service';

@WebSocketGateway({ cors: true , transports: ['websocket', 'polling'] })
export class SalesOrdersGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  constructor(private readonly salesOrdersService: SalesOrdersService, private readonly socketService: SocketService) {}

  async handleConnection(socket: Socket) {
    const user = await this.socketService.getUserFromSocket(socket);
    if (user) {
      await this.socketService.socketRegisterUser(user, socket, 'online')
    }
  }
  @SubscribeMessage('get-account-orders')
  async getOrders(
    @MessageBody() orderDTO: SocketCallDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    // authorize transaction user through call auth token
    const authenticatedClient = await this.socketService.getUserFromAuthToken(
      orderDTO.clientAuth,
    );
    if (authenticatedClient) {
      const orders = await this.salesOrdersService.findOrdersByCustomerOrVendorId(
        authenticatedClient.userID,
      );
      if (orders) {
        // execute socket messaging, direct or broadcast call
        // check authenticatedClient is online, else establish a new socket connection
        const client = await this.socketService.socketRegisterUser(
          authenticatedClient,
          socket,
          'online',
        );
        if (client) {
          const userConnection = await this.socketService.findConnectedUser(client.userID)
          if (userConnection) {
            this.server.sockets
              .to(userConnection.socketID)
              .emit('receive-account_orders', JSON.stringify(orders));
          }
        }
        // on service call execution success, return the new call acknoledgement
        return orders;
      }
    }
  }
}
