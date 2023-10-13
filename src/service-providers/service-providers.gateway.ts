import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { ServiceProvidersService } from './service-providers.service';
import { PlaceOrderSocketDTO, SocketAuthDTO, SocketCallDTO } from 'src/users/dto/create-user.input';
import { SocketService } from 'src/sockets-gateway/service';
import { UsersService } from 'src/users/users.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true , transports: ['websocket', 'polling'] })
export class ServiceProvidersGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  constructor(private readonly serviceProvidersService: ServiceProvidersService, private readonly socketService: SocketService, private readonly usersService: UsersService) {}

  async handleConnection(socket: Socket) {
    const user = await this.socketService.getUserFromSocket(socket);
    if (user) {
      await this.socketService.socketRegisterUser(user, socket, 'online')
    }
  }

  @SubscribeMessage('get-providers')
  async getproviders(
    @MessageBody() socketAuthDTO: SocketAuthDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    // authorize transaction user through call auth token
    const authenticatedClient = await this.socketService.getUserFromAuthToken(
      socketAuthDTO.clientAuth,
    );
    if (authenticatedClient) {
      let providers = await this.usersService.getAllClients()
      providers.map(async (user) => {
        let matchingObject = await this.socketService.findConnectedUser(user.userID)
        if (matchingObject) {
          user.onlineStatus = true;
        } else {
          user.onlineStatus = false;
        }
      });
      providers.sort((a, b) =>
        a.onlineStatus === b.onlineStatus ? 0 : a.onlineStatus ? -1 : 1,
      );

      if (providers) {
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
              .emit('receive-providers', JSON.stringify(providers));
          }
        }
        // on service call execution success, return the new call acknoledgement
        return providers;
      }
    }
  }
  // request-warehouse-service
  @SubscribeMessage('request-warehouse-service')
  async requestWarehouseService(
    @MessageBody() socketAuthDTO: SocketAuthDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    // console.log("@SubscribeMessage('request-warehouse-service')",socketAuthDTO)
    // authorize transaction user through call auth token
    const authenticatedClient = await this.socketService.getUserFromAuthToken(
      socketAuthDTO.clientAuth,
    );
    console.log("@authenticatedClient",)
    if (authenticatedClient) {

      let order = await this.serviceProvidersService.requestBookingOrder(socketAuthDTO)
      console.log("@order",order)
      
      if (order) {
        // on service call execution success, return the new call acknoledgement
        return JSON.stringify(order);
      }
    }
  }
  @SubscribeMessage('get-warehouse-providers')
  async getWarehouseProviders(
    @MessageBody() socketAuthDTO: SocketAuthDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    console.log("@SubscribeMessage('get-warehouse-providers')",socketAuthDTO)
    // authorize transaction user through call auth token
    const authenticatedClient = await this.socketService.getUserFromAuthToken(
      socketAuthDTO.clientAuth,
    );
    console.log("@authenticatedClient",)
    if (authenticatedClient) {
      
      let providers = await this.serviceProvidersService.getAllWarehouseServiceProviders()
      // console.log("@providers",providers)
      
      providers.map(async (provider) => {
        let matchingObject = await this.socketService.findConnectedUser(provider.user.userID)
        if (matchingObject) {
          provider.user.onlineStatus = true;
        } else {
          provider.user.onlineStatus = false;
        }
      });
      if (providers) {
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
              .emit('receive-warehouse-providers', JSON.stringify(providers));
          }
        }
        // on service call execution success, return the new call acknoledgement
        return JSON.stringify(providers);
      }
    }
  }
    @SubscribeMessage('get-account-catalogs')
    async getAccountCatelog(
      @MessageBody() orderDTO: SocketCallDTO,
      @ConnectedSocket() socket: Socket,
    ) {
      // authorize transaction user through call auth token
      const authenticatedClient = await this.socketService.getUserFromAuthToken(
        orderDTO.clientAuth,
      );
      if (authenticatedClient) {
        const accountCatalogs = await this.serviceProvidersService.getAccountCatelog(authenticatedClient.userID);
  
        if (accountCatalogs) {
          // execute socket messaging, direct or broadcast call
          // check authenticatedClient is online, else establish a new socket connection
          const client = await this.socketService.socketRegisterUser(
            authenticatedClient,
            socket,
            'online',
          );
          if (client) {
            const userConnection = await this.socketService.findConnectedUser(client.userID);
            if (userConnection) {
              this.server.sockets
                .to(userConnection.socketID)
                .emit('receive-account-catalogs', JSON.stringify(accountCatalogs));
            }
          }
          // on service call execution success, return the new call acknoledgement
          return accountCatalogs;
        }
      }
    }
  
  }

