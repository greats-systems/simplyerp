import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { BeetrootServicesService } from './beetroot-services.service';
import { SocketPayloadDTO } from '../users/dto/create-user.input';
import { SocketService } from '../sockets-gateway/service';
import { UsersService } from '../users/users.service';
import { ServiceProvidersService } from '../service-providers/service-providers.service';
import { ExhibitService } from './exhibit-service';
import { QuestionDto, Questionnairedto } from './dto/exhibitQuestion.dto';
import { QuestionService } from './question-service';
import { Server, Socket } from 'socket.io';
import { Questionnaire } from './entities/questionaire.entity';
import { Exhibit } from './entities/exhibit.entity';

@WebSocketGateway({ cors: true, transports: ['websocket', 'polling'] })
export class BeetrootServicesGateway {
  @WebSocketServer()
  server: Server;
  constructor(
    private readonly beetrootServicesService: BeetrootServicesService,
    private readonly socketService: SocketService,
    private readonly usersService: UsersService,
    private readonly serviceProvidersService: ServiceProvidersService,
    private readonly exhibitServiceService: ExhibitService,
    private readonly questionService: QuestionService,
  ) {}

  @SubscribeMessage('save-questionnaire')
  async requestWarehouseService(
    @MessageBody() socketPayloadDTO: SocketPayloadDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    // console.log("@SubscribeMessage('request-warehouse-service')",socketPayloadDTO)
    // authorize transaction user through call auth token
    console.log('@socketPayloadDTO.clientAuth', socketPayloadDTO);
    console.log('authenticatedClient',socketPayloadDTO.clientAuth );

    const authenticatedClient = await this.socketService.getUserFromAuthToken(
      socketPayloadDTO.clientAuth,
    );
    console.log('authenticatedClient',authenticatedClient );
    if (authenticatedClient) {
    // console.log('@authenticatedClient', authenticatedClient);
      const qsnaire = JSON.parse(socketPayloadDTO.payload)
      let data: Questionnairedto = JSON.parse(qsnaire['data'])
      console.log('@qsnaire',data );
      data.editor = authenticatedClient
      console.log('QuestionDto',data );

      let questionnaire = await this.questionService.create(data)
      console.log('@questionnaire', questionnaire);

      if (1) {
        // on service call execution success, return the new call acknoledgement
       await this.emitQustionnaires([questionnaire])
        return JSON.stringify(questionnaire);
      }
    }
  }

  @SubscribeMessage('get-questionnaires')
  async getQuestionnaires(
    @MessageBody() socketPayloadDTO: SocketPayloadDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    // console.log("@SubscribeMessage('request-warehouse-service')",socketPayloadDTO)
    // authorize transaction user through call auth token
    console.log('@socketPayloadDTO.clientAuth', socketPayloadDTO);
    console.log('authenticatedClient',socketPayloadDTO.clientAuth );

    const authenticatedClient = await this.socketService.getUserFromAuthToken(
      socketPayloadDTO.clientAuth,
    );
    console.log('authenticatedClient',authenticatedClient );
    if (authenticatedClient) {


      let questionnaire = await this.questionService.findAllQuestionnaires()
      // console.log('@questionnaire', questionnaire);
      if (1) {
        // on service call execution success, return the new call acknoledgement
       await this.emitQustionnaires(questionnaire)
        return JSON.stringify(questionnaire);
      }
    }
  }
  @SubscribeMessage('get-exhibits')
  async getExhibitss(
    @MessageBody() socketPayloadDTO: SocketPayloadDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    // console.log("@SubscribeMessage('request-warehouse-service')",socketPayloadDTO)
    // authorize transaction user through call auth token
    console.log('@socketPayloadDTO.clientAuth', socketPayloadDTO);
    console.log('authenticatedClient',socketPayloadDTO.clientAuth );

    const authenticatedClient = await this.socketService.getUserFromAuthToken(
      socketPayloadDTO.clientAuth,
    );
    console.log('authenticatedClient',authenticatedClient );
    if (authenticatedClient) {


      let exhibits = await this.questionService.findAccountExhibits(authenticatedClient.userID)
      // console.log('@exhibits', exhibits);
      if (1) {
        // on service call execution success, return the new call acknoledgement
       await this.emitExhibits(exhibits)
        // return JSON.stringify(exhibits);
      }
    }
  }
  
  async emitQustionnaires(questionnaires: Questionnaire[]){
    const userConnections = await this.socketService.findConnectedUsers()
    if (userConnections) {
    console.log('userConnections length',userConnections.length );
      await Promise.all(
        userConnections.map((connectedUsr)=>{
          this.server.sockets
          .to(connectedUsr.socketID)
          .emit('receive_questionnaires', JSON.stringify(questionnaires));
        })
      );

    }
  }
  // receive_exhibits
  async emitExhibits(exhibits: Exhibit[]){
    const userConnections = await this.socketService.findConnectedUsers()
    if (userConnections) {
    console.log('userConnections length',userConnections.length );
      await Promise.all(
        userConnections.map((connectedUsr)=>{
          this.server.sockets
          .to(connectedUsr.socketID)
          .emit('receive_exhibits', JSON.stringify(exhibits));
        })
      );

    }
  }
}

