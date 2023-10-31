import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { defaultApp } from '../common/auth/firebaseAdmin';
import { BeetrootServicesService } from '../beetroot-services/beetroot-services.service';
import { ExhibitService } from '../beetroot-services/exhibit-service';
import { QuestionService } from '../beetroot-services/question-service';
import { ServiceProvidersService } from '../service-providers/service-providers.service';
import { SocketService } from '../sockets-gateway/service';
import { UsersService } from '../users/users.service';
import { Chat, Message } from './entities/messaging.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    private readonly beetrootServicesService: BeetrootServicesService,
    private readonly socketService: SocketService,
    private readonly usersService: UsersService,
    private readonly serviceProvidersService: ServiceProvidersService,
    private readonly exhibitServiceService: ExhibitService,
    private readonly questionService: QuestionService,
  ) {}

  private allUsers = [];
  private connectedUsers = [];

  async getMessages(): Promise<Message[]> {
    return await this.messageRepository.find();
  }

  async saveMessage(
    senderID: string,
    recipientID: string,
    message: Message,
  ): Promise<Chat> {
    let recipients;
    let contactName;
    console.log('saveMessage chat', message);
    let chat;
    let sender = await this.usersService.findOneByUserID(senderID);
    let recipient = await this.usersService.findOneByUserID(recipientID);
    chat = await this.findChat(senderID, recipientID);
    if (!chat) {
      chat = await this.createChat(senderID, recipientID);
    }
    if (chat) {
      await this.createChatMessage(chat, message, recipient, sender);
      const getChat = await this.findChatByID(chat.id);
      console.log('saveMessage getChat', getChat);
      return getChat;
    }
  }

  async createChatMessage(
    chat: Chat,
    message: Message,
    recipient: User,
    sender: User,
  ): Promise<Message> {
    try {
      const newMessageOb = new Message();
      newMessageOb.chat = chat;
      newMessageOb.message = message.message;
      newMessageOb.time = message.time;
      newMessageOb.role = message.role;
      newMessageOb.read = message.read;
      newMessageOb.type = message.type;
      (newMessageOb.recipientID = recipient.userID),
        (newMessageOb.recipient = recipient),
        (newMessageOb.sender = sender),
        (newMessageOb.senderID = sender.userID),
        (newMessageOb.status = 'new');
      const createdMessage = this.messageRepository.create(newMessageOb);
      const newMessag = await this.messageRepository.save(createdMessage);
      chat.messages.push(newMessag);
      await this.chatRepository.save(chat);
      const newMSG = await this.findMessage(newMessag.id);
      return newMSG;
    } catch (error) {
      return;
    }
  }

  userConnected(userName: string, registrationToken: string) {
    let user = { userName: userName, registrationToken: registrationToken };
    const filteredUsers = this.allUsers.filter((u) => u.userName === userName);
    if (filteredUsers.length == 0) {
      this.allUsers.push(user);
    } else {
      user = filteredUsers[0];
      user.registrationToken = registrationToken;
    }
    this.connectedUsers.push(userName);
    console.log('All Users', this.allUsers);
    console.log('Connected Users', this.connectedUsers);
  }

  userDisconnected(userName: string) {
    let userIndex = this.connectedUsers.indexOf(userName);
    this.connectedUsers.splice(userIndex, 1);
    console.log('All Users', this.allUsers);
    console.log('Connected Users', this.connectedUsers);
  }

  async sendMessagesToOfflineUsers(chat: any) {
    var messagePayload = {
      data: {
        type: 'CHAT',
        title: 'chat',
        message: chat.message,
        sender: chat.sender,
        recipient: chat.recipient,
        time: chat.time,
      },
      tokens: [],
    };
    const userTokens = this.allUsers
      .filter((user) => !this.connectedUsers.includes(user.userName))
      .map((user) => {
        return user.registrationToken;
      });
    if (userTokens.length == 0) {
      return;
    }
    messagePayload.tokens = userTokens;
    try {
      await defaultApp.messaging().sendMulticast(messagePayload);
    } catch (ex) {
      console.log(JSON.stringify(ex));
    }
  }

  async createChat(senderID: string, recipientID: string) {
    try {
      let sender = await this.usersService.findOneByUserID(senderID);
      let recipient = await this.usersService.findOneByUserID(recipientID);
      const neeChatOb = new Message();
      neeChatOb.sender = sender;
      neeChatOb.recipient = recipient;

      await this.chatRepository.save(neeChatOb);
      return this.findChat(senderID, recipientID);
    } catch (error) {
      console.log(error);
    }
  }
  async findChat(senderID: string, recieverID: string): Promise<Chat> {
    const queryBuilder = this.chatRepository.createQueryBuilder('chat');
    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('chat.recipient', 'recipient')
      .leftJoinAndSelect('chat.sender', 'sender')
      .leftJoinAndSelect('chat.messages', 'messages');
    // Use OR to match either customer or provider userID
    queryBuilder.where(
      'recipient.userID = :recieverID AND sender.userID = :senderID',
      { recieverID, senderID },
    );
    const chat = await queryBuilder.getOne();
    console.log('@chat', chat);
    return chat;
  }
  async findChatByID(chatID: string): Promise<Chat> {
    const queryBuilder = this.chatRepository.createQueryBuilder('chat');
    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('chat.recipient', 'recipient')
      .leftJoinAndSelect('chat.sender', 'sender')
      .leftJoinAndSelect('chat.messages', 'messages');
    // Use OR to match either customer or provider userID
    queryBuilder.where('chat.id = :chatID', { chatID });
    const chat = await queryBuilder.getOne();
    console.log('@chat', chat);
    return chat;
  }
  async findMessage(messageID: string): Promise<Message> {
    const queryBuilder = this.messageRepository.createQueryBuilder('message');
    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('message.recipient', 'recipient')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.chat', 'chat');
    // Use OR to match either customer or provider userID
    queryBuilder.where('message.id = :messageID', { messageID });
    const message = await queryBuilder.getOne();
    // console.log('@message', message);
    return message;
  }

  async findAccountChats(senderID: string): Promise<Chat[]> {
    const queryBuilder = this.chatRepository.createQueryBuilder('chat');
    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('chat.recipient', 'recipient')
      .leftJoinAndSelect('chat.sender', 'sender')
      .leftJoinAndSelect('chat.messages', 'messages');
    queryBuilder.where(' sender.userID = :senderID', { senderID });

    const chats = await queryBuilder.getMany();
    console.log('@chats', chats);
    return chats;
  }
  async findChats(): Promise<Chat[]> {
    const queryBuilder = this.chatRepository.createQueryBuilder('chat');
    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('chat.recipient', 'recipient')
      .leftJoinAndSelect('chat.sender', 'sender')
      .leftJoinAndSelect('chat.messages', 'messages');
    const chats = await queryBuilder.getMany();
    console.log('@chats', chats);
    return chats;
  }
}
