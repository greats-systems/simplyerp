
import {
  ConnectedSocket,
  MessageBody, OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessageDTO, SocketAuthDTO } from '../users/dto/create-user.input';

import { SocketService } from './service';
import { Server, Socket } from 'socket.io';
const connectUsers = []

@WebSocketGateway({ cors: true , transports: ['websocket', 'polling'] })
export class SocketsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly socketService: SocketService,
  ) {
  }
  async handleConnection(socket: Socket) {
    if(socket.handshake.auth['token']){
    const  user = await this.socketService.getUserFromAuthToken(socket.handshake.auth['token']);
    // console.log('handleConnection socket user',user )
    await this.socketService.socketRegisterUser(user, socket, 'online')
    }else{
      const user = this.socketService.getUserFromSocket(socket);
      if (user) {
        await this.socketService.socketRegisterUser(user, socket, 'online')
      }
    }
  }

  @SubscribeMessage('notify-online-status')
  async notifyOnlineStatus(
    @MessageBody() socketAuthDTO: SocketAuthDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    // console.log('socketAuthDTO', socketAuthDTO)
    let sender: any;
    const authenticatedClient = await this.socketService.getUserFromAuthToken(
      socketAuthDTO.clientAuth,
    );
    if (authenticatedClient) {
      sender = await this.socketService.socketRegisterUser(authenticatedClient, socket, socketAuthDTO.status);
      const data = {
        socketID: sender.socketID,
        data: sender,
      };
      this.server.sockets
        .to(sender.socketID)
        .emit('update-online-status', JSON.stringify(data));
        return data;
    }
    return;
  }

  @SubscribeMessage('new-message')
  async newMessage(
    @MessageBody() socketAuthDTO: MessageDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    console.log('socketAuthDTO', socketAuthDTO)
    let sender: any;
    const authenticatedClient = await this.socketService.getUserFromAuthToken(
      socketAuthDTO.clientAuth,
    );
    if (authenticatedClient) {
      const authenticatedReciever = await this.socketService.getUserByID(
        socketAuthDTO.recieverID,
      );
      console.log('authenticatedReciever', authenticatedReciever)
      let receiver = await this.socketService.findConnectedUser(socketAuthDTO.recieverID)
      console.log('recieve-receiver', receiver)
      const receiverData = {
        socketID: receiver.socketID,
        receiver: receiver,
        textContent: socketAuthDTO.textContent,
        mediaContent: socketAuthDTO.mediaContent,
        status: socketAuthDTO.status,
        time: socketAuthDTO.time

      };
      console.log('receiver.socketID', receiver.socketID)

      this.server.sockets
        .to(receiver.socketID)
        .emit('recieve-message', JSON.stringify(receiverData));

      sender = await this.socketService.socketRegisterUser(authenticatedClient, socket, socketAuthDTO.status);
      const senderData = {
        socketID: sender.socketID,
        data: sender,
      };
      this.server.sockets
        .to(sender.socketID)
        .emit('update-message-status', JSON.stringify(senderData));
    }
  }
}