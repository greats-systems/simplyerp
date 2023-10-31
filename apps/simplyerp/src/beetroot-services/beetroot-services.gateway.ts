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
import {
  ExhibitSocketPayloadDTO,
  QuestionDto,
  Questionnairedto,
} from './dto/exhibitQuestion.dto';
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

  @SubscribeMessage('create-questionnaire')
  async saveQuestionnaire(
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
      // console.log('@authenticatedClient', authenticatedClient);
      const qsnaire = JSON.parse(socketPayloadDTO.payload);
      let data: Questionnairedto = JSON.parse(qsnaire['data']);

      data.editor = authenticatedClient;
      let questionnaire = await this.questionService.createQuestionnaire(data);
      if (1) {
        // on service call execution success, return the new call acknoledgement
        //  await this.emitQustionnaires([questionnaire])
        return JSON.stringify(questionnaire);
      }
    }
  }

  @SubscribeMessage('create-questionnaire-section')
  async createQuestionnaireSection(
    @MessageBody() socketPayloadDTO: SocketPayloadDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    const authenticatedClient = await this.socketService.getUserFromAuthToken(
      socketPayloadDTO.clientAuth,
    );
    console.log('authenticatedClient', authenticatedClient);
    if (authenticatedClient) {
      // console.log('@authenticatedClient', authenticatedClient);
      const qsnaire = JSON.parse(socketPayloadDTO.payload);
      let data: Questionnairedto = JSON.parse(qsnaire['data']);
      data.editor = authenticatedClient;

      let questionnaireSection =
        await this.questionService.createQuestionnaireSection(data);

      if (1) {
        // on service call execution success, return the new call acknoledgement
        //  await this.emitQustionnaires([questionnaireSection])
        return JSON.stringify(questionnaireSection);
      }
    }
  }

  // saveQuestionnaireSectionQuestions

  @SubscribeMessage('save-questionnaire-section-questions')
  async saveQuestionnaireSectionQuestions(
    @MessageBody() socketPayloadDTO: SocketPayloadDTO,
    @ConnectedSocket() socket: Socket,
  ) {

    const authenticatedClient = await this.socketService.getUserFromAuthToken(
      socketPayloadDTO.clientAuth,
    );
    console.log('authenticatedClient', authenticatedClient);
    if (authenticatedClient) {
      // console.log('@authenticatedClient', authenticatedClient);
      const qsnaire = JSON.parse(socketPayloadDTO.payload);
      let data: Questionnairedto = JSON.parse(qsnaire['data']);
      data.editor = authenticatedClient;

      let questionnaire =
        await this.questionService.saveQuestionnaireSectionQuestions(data);

      if (1) {
        // on service call execution success, return the new call acknoledgement
        //  await this.emitQustionnaires([questionnaire])
        return JSON.stringify(questionnaire);
      }
    }
  }

  // get-questionnaire-sections
  @SubscribeMessage('get-questionnaire-sections')
  async getQuestionnaireSections(
    @MessageBody() socketPayloadDTO: ExhibitSocketPayloadDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    const authenticatedClient = await this.socketService.getUserFromAuthToken(
      socketPayloadDTO.clientAuth,
    );
    if (authenticatedClient) {
      let questionnaire = await this.questionService.findOneQuestionnaireByID(socketPayloadDTO.questionnaireID);
      // console.log('@questionnaire', questionnaire);
      if (1) {
        // on service call execution success, return the new call acknoledgement
        // await this.emitQustionnaires(questionnaire);
        return JSON.stringify(questionnaire);
      }
    }
  }
  @SubscribeMessage('get-questionnaires')
  async getQuestionnaires(
    @MessageBody() socketPayloadDTO: SocketPayloadDTO,
    @ConnectedSocket() socket: Socket,
  ) {

    const authenticatedClient = await this.socketService.getUserFromAuthToken(
      socketPayloadDTO.clientAuth,
    );
    console.log('authenticatedClient', authenticatedClient);
    if (authenticatedClient) {
      let questionnaire = await this.questionService.findAllQuestionnaires();
      // console.log('@questionnaire', questionnaire);
      if (1) {
        // on service call execution success, return the new call acknoledgement
        await this.emitQustionnaires(questionnaire);
        return JSON.stringify(questionnaire);
      }
    }
  }

  @SubscribeMessage('get-posts')
  async getPosts(
    @MessageBody() socketPayloadDTO: SocketPayloadDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    const authenticatedClient = await this.socketService.getUserFromAuthToken(
      socketPayloadDTO.clientAuth,
    );
    console.log('authenticatedClient', authenticatedClient);
    if (authenticatedClient) {
      console.log('getting - posts');
      let posts = await this.exhibitServiceService.getPosts();
      // console.log('@posts', posts);
      if (1) {
        // on service call execution success, return the new call acknoledgement
        console.log('emit - posts');
        await this.emitPosts(posts);
        return JSON.stringify(posts);
      }
    }
  }
  // get-next-questionnaire-section
  @SubscribeMessage('get-next-questionnaire-section')
  async getNextQuestionnaireSection(
    @MessageBody() socketPayloadDTO: ExhibitSocketPayloadDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    const authenticatedClient = await this.socketService.getUserFromAuthToken(
      socketPayloadDTO.clientAuth,
    );
    console.log('authenticatedClient', authenticatedClient);
    if (authenticatedClient) {
      let section =
        await this.questionService.getNextQuestionnaireSection(
          socketPayloadDTO.questionnaireSectionID,
          socketPayloadDTO.clientID,
        );
      if (section) {
       return {
          status: 200,
          data: JSON.stringify(section),
          error: null,
          errorMessage: null,
          successMessage: 'proceed',
        } ;
      }else{
        return {
          status: 200,
          data: null,
          error: null,
          errorMessage: null,
          successMessage: 'exhibit_fee_not_paid',
        }
      }
    }
  }
  @SubscribeMessage('get-exhibits')
  async getExhibitss(
    @MessageBody() socketPayloadDTO: SocketPayloadDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    const authenticatedClient = await this.socketService.getUserFromAuthToken(
      socketPayloadDTO.clientAuth,
    );
    console.log('authenticatedClient', authenticatedClient);
    if (authenticatedClient) {
      let exhibits = await this.questionService.findAccountExhibits(
        authenticatedClient.userID,
      );
      // console.log('@exhibits', exhibits);
      if (1) {
        // on service call execution success, return the new call acknoledgement
        await this.emitExhibits(exhibits);
        // return JSON.stringify(exhibits);
      }
    }
  }
  async emitNextQuestionnaireSection(questionnaires: Questionnaire) {
    const userConnections = await this.socketService.findConnectedUsers();
    if (userConnections) {
      console.log('userConnections length', userConnections.length);
      await Promise.all(
        userConnections.map((connectedUsr) => {
          this.server.sockets
            .to(connectedUsr.socketID)
            .emit(
              'receive_next_questionnaire_section',
              JSON.stringify(questionnaires),
            );
        }),
      );
    }
  }

  async emitPosts(posts: any[]) {
    const userConnections = await this.socketService.findConnectedUsers();
    if (userConnections) {
      console.log('userConnections length', userConnections.length);
      await Promise.all(
        userConnections.map((connectedUsr) => {
          this.server.sockets
            .to(connectedUsr.socketID)
            .emit('receive_posts', JSON.stringify(posts));
        }),
      );
    }
  }

  async emitQustionnaires(questionnaires: Questionnaire[]) {
    const userConnections = await this.socketService.findConnectedUsers();
    if (userConnections) {
      console.log('userConnections length', userConnections.length);
      await Promise.all(
        userConnections.map((connectedUsr) => {
          this.server.sockets
            .to(connectedUsr.socketID)
            .emit('receive_questionnaires', JSON.stringify(questionnaires));
        }),
      );
    }
  }
  // receive_exhibits
  async emitExhibits(exhibits: Exhibit[]) {
    const userConnections = await this.socketService.findConnectedUsers();
    if (userConnections) {
      console.log('userConnections length', userConnections.length);
      await Promise.all(
        userConnections.map((connectedUsr) => {
          this.server.sockets
            .to(connectedUsr.socketID)
            .emit('receive_exhibits', JSON.stringify(exhibits));
        }),
      );
    }
  }
}
