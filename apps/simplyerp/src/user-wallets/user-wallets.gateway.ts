import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { UserWalletsService } from './user-wallets.service';
import { CreateUserWalletDto } from './dto/create-user-wallet.dto';
import { UpdateUserWalletDto } from './dto/update-user-wallet.dto';
import { Server, Socket } from 'socket.io';
import { SocketAuthDTO } from '../users/dto/create-user.input';
import { SocketService } from '../sockets-gateway/service';

@WebSocketGateway({ cors: true , transports: ['websocket', 'polling'] })
export class UserWalletsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  constructor(private readonly userWalletsService: UserWalletsService, private readonly socketService: SocketService) {}
  //
  async handleConnection(socket: Socket) {
    const user = await this.socketService.getUserFromSocket(socket);
    if (user) {
      await this.socketService.socketRegisterUser(user, socket, 'online')
    }
  }
  @SubscribeMessage('get-wallet-balance')
  async getWalletbalance(
    @MessageBody() socketAuthDTO: SocketAuthDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    // authorize transaction user through call auth token
    const authenticatedClient = await this.socketService.getUserFromAuthToken(
      socketAuthDTO.clientAuth,
    );
    if (authenticatedClient) {
      const fetchWallet = await this.userWalletsService.findWallet(
        authenticatedClient.userID,
      );
      if (fetchWallet) {
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
              .emit('recieve-wallet-update', JSON.stringify(fetchWallet));
          }
        }
        // on service call execution success, return the new call acknoledgement
        return fetchWallet;
      }
    }
  }
}
