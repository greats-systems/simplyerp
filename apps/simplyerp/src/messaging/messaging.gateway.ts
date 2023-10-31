import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { MessagingService } from './messaging.service';
import { Server, Socket } from 'socket.io';
import { BeetrootServicesService } from '../beetroot-services/beetroot-services.service';
import { ExhibitService } from '../beetroot-services/exhibit-service';
import { QuestionService } from '../beetroot-services/question-service';
import { ServiceProvidersService } from '../service-providers/service-providers.service';
import { SocketService } from '../sockets-gateway/service';
import { UsersService } from '../users/users.service';
import { SocketPayloadDTO } from '../users/dto/create-user.input';
import { User } from '../users/entities/user.entity';

@WebSocketGateway({ cors: true, transports: ['websocket', 'polling'] })
export class MessagingGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  constructor(
    private readonly messagingService: MessagingService,
    private readonly beetrootServicesService: BeetrootServicesService,
    private readonly socketService: SocketService,
    private readonly usersService: UsersService,
    private readonly serviceProvidersService: ServiceProvidersService,
    private readonly exhibitServiceService: ExhibitService,
    private readonly questionService: QuestionService,
  ) {}
  async handleConnection(socket: Socket) {
    const user = await this.socketService.getUserFromSocket(socket);
    if (user) {
      await this.socketService.socketRegisterUser(user, socket, 'online');
    }
  }
  // handleConnection(socket: any) {
  //   const query = socket.handshake.query;
  //   console.log('Connect', query);
  //   this.messagingService.userConnected(query.userName, query.registrationToken);
  //   process.nextTick(async () => {
  //     socket.emit('allMessages', await this.messagingService.getMessages());
  //   });
  // }

  // handleDisconnect(socket: any) {
  //   const query = socket.handshake.query;
  //   console.log('Disconnect', socket.handshake.query);
  //   this.messagingService.userDisconnected(query.userName);
  // }

  // @Bind(MessageBody(), ConnectedSocket())
  // @SubscribeMessage('chat')
  // async handleNewMessage(chat: Message, sender: any) {
  //   console.log('New Message', chat);
  //   await this.messagingService.saveMessage(chat.senderID, chat.recieverID, chat);
  //   sender.emit('newMessage', chat);
  //   sender.broadcast.emit('newMessage', chat);
  //   await this.messagingService.sendMessagesToOfflineUsers(chat);
  // }

  @SubscribeMessage('get-all-contacts')
  async getAllContacts(
    @MessageBody() socketPayloadDTO: SocketPayloadDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    const authenticatedClient = await this.socketService.getUserFromAuthToken(
      socketPayloadDTO.clientAuth,
    );
    console.log('authenticatedClient', authenticatedClient);
    if (authenticatedClient) {
      let contacts = await this.usersService.findAll();
      // console.log('@contacts', contacts);
      const client = await this.socketService.socketRegisterUser(
        authenticatedClient,
        socket,
        'online',
      );
      if (client) {
        const userConnection = await this.socketService.findConnectedUser(
          client.userID,
        );
        if (userConnection) {
          this.server.sockets
            .to(userConnection.socketID)
            .emit('receive_contacts', JSON.stringify(contacts));
        }
      }
    }
  }

  // search-contact
  @SubscribeMessage('search-contact')
  async searchContacts(
    @MessageBody() socketPayloadDTO: SocketPayloadDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    // authorize transaction user through call auth token
    const authenticatedClient = await this.socketService.getUserFromAuthToken(
      socketPayloadDTO.clientAuth,
    );
    console.log('authenticatedClient', authenticatedClient);
    if (authenticatedClient) {
      let contacts = await this.usersService.findAll();
      if (1) {
        // on service call execution success, return the new call acknoledgement
        // await this.emitQustionnaires(questionnaire);
        return JSON.stringify(contacts);
      }
    }
  }

  // @SubscribeMessage('new-message')
  // async newMessage(
  //   @MessageBody() socketAuthDTO: MessageDTO,
  //   @ConnectedSocket() socket: Socket,
  // ) {
  //   console.log('socketAuthDTO', socketAuthDTO)
  //   let sender: any;
  //   const authenticatedClient = await this.socketService.getUserFromAuthToken(
  //     socketAuthDTO.clientAuth,
  //   );
  //   if (authenticatedClient) {
  //     const authenticatedReciever = await this.socketService.getUserByID(
  //       socketAuthDTO.recieverID,
  //     );
  //     console.log('authenticatedReciever', authenticatedReciever)
  //     let receiver = await this.socketService.findConnectedUser(socketAuthDTO.recieverID)
  //     console.log('recieve-receiver', receiver)
  //     const receiverData = {
  //       socketID: receiver.socketID,
  //       receiver: receiver,
  //       textContent: socketAuthDTO.textContent,
  //       mediaContent: socketAuthDTO.mediaContent,
  //       status: socketAuthDTO.status,
  //       time: socketAuthDTO.time

  //     };
  //     console.log('receiver.socketID', receiver.socketID)

  //     this.server.sockets
  //       .to(receiver.socketID)
  //       .emit('recieve-message', JSON.stringify(receiverData));

  //     sender = await this.socketService.socketRegisterUser(authenticatedClient, socket, socketAuthDTO.status);
  //     const senderData = {
  //       socketID: sender.socketID,
  //       data: sender,
  //     };
  //     this.server.sockets
  //       .to(sender.socketID)
  //       .emit('update-message-status', JSON.stringify(senderData));
  //   }
  // }
  @SubscribeMessage('chat')
  async sendMessage(
    @MessageBody() socketPayloadDTO: SocketPayloadDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    // console.log("@SubscribeMessage('request-warehouse-service')",socketPayloadDTO)
    // authorize transaction user through call auth token
    const authenticatedClient = await this.socketService.getUserFromAuthToken(
      socketPayloadDTO.clientAuth,
    );
    console.log('authenticatedClient', authenticatedClient);
    if (authenticatedClient) {
      const payload = JSON.parse(socketPayloadDTO.payload);
      console.log('New Message', payload);
      const message = await this.messagingService.saveMessage(
        payload['senderID'],
        payload['recieverID'],
        payload['message'],
      );
      // sender.emit('newMessage', chat);
      // sender.broadcast.emit('newMessage', chat);
      // const client = await this.socketService.socketRegisterUser(
      //   message.recipient,
      //   socket,
      //   'online',
      // );
      
        const userConnection = await this.socketService.findConnectedUser(
          message.recipient.userID,
        );
        console.log('New userConnection', userConnection);
        if (userConnection) {
          console.log('New userConnection', userConnection);
          this.server.sockets
            .to(userConnection.socketID)
            .emit('receive-message', JSON.stringify(message));
        }
      
      await this.messagingService.sendMessagesToOfflineUsers(message);
      return JSON.stringify(message);
    }
  }

  async emitContacts(authenticatedClient: User, contacts: User[]) {
    const userConnections = await this.socketService.findConnectedUsers();
    if (userConnections) {
      await Promise.all(
        userConnections.map((connectedUsr) => {
          if (connectedUsr.userID == authenticatedClient.userID) {
            this.server.sockets
              .to(connectedUsr.socketID)
              .emit('receive_contacts', JSON.stringify(userConnections));
          }
        }),
      );
    }
  }
}
