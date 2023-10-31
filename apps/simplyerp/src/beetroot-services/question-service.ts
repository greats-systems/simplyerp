// question.service.ts
import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ExhibitImage,
  Question,
  Questionnaire,
  QuestionnaireSection,
} from './entities/questionaire.entity';
import {
  ExhibitQuestionairedto,
  ExhibitSectionDto,
  QuestionDto,
  QuestionnaireSectionDto,
  Questionnairedto,
} from './dto/exhibitQuestion.dto';
import { UsersService } from '../users/users.service';
import { ExhibitService } from './exhibit-service';
import { Exhibit } from './entities/exhibit.entity';
// import SearchService from '../search/search.service';
import { User } from '../users/entities/user.entity';
import { SalesOrdersService } from '../sales-orders/sales-orders.service';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Questionnaire)
    private readonly questionnaireRepository: Repository<Questionnaire>,
    @InjectRepository(QuestionnaireSection)
    private readonly questionnaireSectionRepository: Repository<QuestionnaireSection>,
    @InjectRepository(Exhibit)
    private readonly exhibitRepository: Repository<Exhibit>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(ExhibitImage)
    private readonly exhibitImageRepository: Repository<ExhibitImage>,
    private usersService: UsersService,
    private salesOrdersService: SalesOrdersService,
    // private searchService: SearchService,
  ) {}

  async getEntreprenuers(): Promise<User[]> {
    return this.usersService.getAllClients();
  }

  async findAll(): Promise<Question[]> {
    return this.questionRepository.find({ relations: ['questionnaires'] });
  }
  async findOne(id: string): Promise<Question> {
    return this.questionRepository.findOne({
      where: { id: id },
      relations: ['questionnaires'],
    });
  }

  async createQuestionnaire(
    createQuestionDto: Questionnairedto,
  ): Promise<Questionnaire> {
    const { ...questionData } = createQuestionDto;
    console.log('@questionData', questionData);
    const qsnaire = new Questionnaire();
    qsnaire.title = questionData.title;
    qsnaire.category = questionData.category;
    qsnaire.searchTerms = questionData.searchTerms;
    const newQnaire = await this.questionnaireRepository.save(qsnaire);
    return newQnaire;
  }
  async createQuestionnaireSection(
    questionnaireSectionDto: QuestionnaireSectionDto,
  ): Promise<QuestionnaireSection> {
    console.log(
      '@create Questionnaire Section Data',
      questionnaireSectionDto.questionnaireID,
    );
    const getQuestionnaire = await this.findOneQuestionnaire(
      questionnaireSectionDto.questionnaireID,
    );
    const qsnaire = new QuestionnaireSection();
    qsnaire.questionnaireID = getQuestionnaire.id;
    qsnaire.title = questionnaireSectionDto.title;
    qsnaire.questionnaires = [getQuestionnaire];
    const newQnaireSection =
      await this.questionnaireSectionRepository.save(qsnaire);
    return newQnaireSection;
  }

  async getNextQuestionnaireSection(id: string, userID: string) {
    const checkIfUserPaidExhibitFee =
      await this.salesOrdersService.checkIfUserPaidExhibitFee(userID);
      console.log('checkIfUserPaidExhibitFee', checkIfUserPaidExhibitFee)
    if (checkIfUserPaidExhibitFee) {
      // Execute the query and return the results
      const section = await this.NextQuestionnaireSection(id);
      console.log('@section', section);
      return section;
    }else{
       return null
    }
  }
  async saveQuestionnaireSectionQuestions(
    createQuestionDto: Questionnairedto,
  ): Promise<QuestionnaireSection> {
    const { ...questionData } = createQuestionDto;
    console.log('@questionData', questionData);
    let qsns = [];
    let questionnaireSection: QuestionnaireSection;
    if (createQuestionDto.questionnaireSectionID) {
      questionnaireSection = await this.questionnaireSectionRepository.findOne({
        where: { id: createQuestionDto.questionnaireSectionID },
      });
    } else {
      const questionnaireSectionDto = {
        questionnaireID: createQuestionDto.questionnaireID,
        title: createQuestionDto.title,
      };
      questionnaireSection = await this.createQuestionnaireSection(
        questionnaireSectionDto,
      );
    }

    console.log('questionnaireSection', questionnaireSection);
    if (questionData.questions.length > 0) {
      await Promise.all(
        questionData.questions.map(async (q: any) => {
          console.log('saveQuestionnaireSectionQuestions q: Question', q);
          if (q.question !== '') {
            const question = new Question();
            question.question = q.question;
            question.category = questionData.category;
            question.searchTerms = questionData.searchTerms;
            question.questionnaireSections = [questionnaireSection];
            const qsn = await this.questionRepository.save(question);
            console.log('qsn', qsn);
            qsns.push(qsn);
          }
        }),
      );
    }
    questionnaireSection.questions = qsns;
    await this.questionnaireSectionRepository.save(questionnaireSection);
    const updatedQuestionnaireSection = await this.findOneQuestionnaireSection(
      questionnaireSection.id,
    );
    console.log('updateQuestionnaireSection', updatedQuestionnaireSection);
    return updatedQuestionnaireSection;
  }

  async createExhibit(
    authToken: string,
    questionnaireID: string,
  ): Promise<any> {
    console.log('@questionData', questionnaireID);

    const questionnaire = await this.findOneQuestionnaire(questionnaireID);

    const client = await this.usersService.decodeUserToken(authToken);
    const exhibitInstance = new Exhibit();
    exhibitInstance.client = client;
    exhibitInstance.questionnaire = questionnaire;
    const newEx = await this.exhibitRepository.save(exhibitInstance);
    const updateExhibit = await this.findOneExhibit(newEx.id);
    console.log('updateExhibit', updateExhibit);
    return {
      status: 200,
      data: JSON.stringify(updateExhibit),
      error: null,
      errorMessage: null,
      successMessage: 'success',
    };
  }
  async saveEditorExhibitResponses(
    authToken: string,
    questionnaireID: string,
    intervieweeID: string,
    questions: any,
  ): Promise<any> {
    console.log('@exhibitSection', questionnaireID);
    let qsns = [];
    const questionnaireInstance =
      await this.findOneQuestionnaire(questionnaireID);
    const intervieweeInstance =
      await this.usersService.findOneByUserID(intervieweeID);
    const exhibitInstance = await this.createExhibit(
      authToken,
      questionnaireID,
    );
    if (questions.length > 0) {
      await Promise.all(
        questions.map(async (q: Question) => {
          console.log('q: Question', q);
          if (q && q.question != '' && q.answer != '') {
            const question = new Question();
            question.question = q.question;
            question.category = questionnaireInstance.category;
            question.searchTerms = questionnaireInstance.searchTerms;
            question.responder = intervieweeInstance;
            question.answer = q.answer;
            const qsn = await this.questionRepository.save(question);
            console.log('qsn', qsn);
            qsns.push(qsn);
          }
        }),
      );
    }
    exhibitInstance.questions = qsns;
    const newEx = await this.exhibitRepository.save(exhibitInstance);
    const updateExhibit = await this.findOneExhibit(newEx.id);
    console.log('updateExhibit', updateExhibit);
    return updateExhibit;
  }

  async saveExhibitSectionResponses(
    authToken: string,
    exhibitSection: ExhibitSectionDto,
    files: any,
  ): Promise<any> {
    console.log('@exhibitSection', exhibitSection);
    let qsns = [];
    const exhibitInstance = await this.findOneExhibit(exhibitSection.exhibitID);

    if (exhibitSection.questions.length > 0) {
      await Promise.all(
        exhibitSection.questions.map(async (q: Question) => {
          if (q) {
            const question = new Question();
            question.question = q.question;
            question.category = q.category;
            question.searchTerms = q.searchTerms;
            question.responder = q.responder;
            question.answer = q.answer;
            const qsn = await this.questionRepository.save(question);
            console.log('qsn', qsn);
            qsns.push(qsn);
          }
        }),
      );
    }
    exhibitInstance.questions = qsns;
    const newEx = await this.exhibitRepository.save(exhibitInstance);
    const updateExhibit = await this.findOneExhibit(newEx.id);
    console.log('updateExhibit', updateExhibit);
    return {
      status: 200,
      data: JSON.stringify(updateExhibit),
      error: null,
      errorMessage: null,
      successMessage: 'success',
    };
  }
  async submitExhibitForReview(
    authToken: string,
    questionnaire: Questionnaire,
    files: any,
  ) {
    const newUser = await this.usersService.decodeUserToken(authToken);

    let newFiles = [];
    delete questionnaire.id;
    if (files) {
      await Promise.all(
        files.map(async (file: LocalFileDto) => {
          const image = {
            path: file.path,
            filename: file.filename,
            mimetype: file.mimetype,
          };
          const newImageSchema =
            await this.exhibitImageRepository.create(image);
          const newFile =
            await this.exhibitImageRepository.save(newImageSchema);
          newFiles.push(newFile);
        }),
      );
      questionnaire.images = newFiles;
    }
    console.log('questionnaire', questionnaire.id, questionnaire);
    const newQuestionnaire =
      await this.questionnaireRepository.save(questionnaire);
    console.log(
      'submitExhibitForReview',
      newQuestionnaire.id,
      newQuestionnaire,
    );
    const getExhibit = await this.findOne(newQuestionnaire.id);
    // }
    console.log('submitExhibitForReview', getExhibit);
    const indexExhibit = {
      id: getExhibit.id,
      title: questionnaire.title,
      category: getExhibit.category,
      responderFirstName: getExhibit.responder.firstName,
      responderLastName: getExhibit.responder.lastName,
      question: getExhibit.question,
      answer: getExhibit.answer,
      searchTerms: getExhibit.searchTerms,
      body: questionnaire.body,
    };
    // const indexed = await this.searchService.indexExhibit(indexExhibit);
    // console.log('indexed', indexed);

    return {
      status: 200,
      data: JSON.stringify(getExhibit),
      error: null,
      errorMessage: null,
      successMessage: 'success',
    };
  }
  async findAllQuestions(): Promise<Question[]> {
    const queryBuilder = this.questionRepository.createQueryBuilder('question');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('question.editor', 'editor')
      .leftJoinAndSelect('question.questions', 'questions');

    // Use OR to match either customer or provider userID
    // queryBuilder.where('question.searchTerms = :searchTerms', {
    //   searchTerms,
    // });

    // Execute the query and return the results
    const question = await queryBuilder.getMany();

    console.log('@question', question);
    return question;
  }
  async findOneQuestion(id: string): Promise<Question[]> {
    const queryBuilder = this.questionRepository.createQueryBuilder('question');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('question.editor', 'editor')
      .leftJoinAndSelect('question.question', 'question');

    // Use OR to match either customer or provider userID
    queryBuilder.where('question.id = :id', {
      id,
    });

    // Execute the query and return the results
    const question = await queryBuilder.getMany();

    console.log('@question', question);
    return question;
  }
  async findAllQuestionnaires(): Promise<Questionnaire[]> {
    const queryBuilder =
      this.questionnaireRepository.createQueryBuilder('questionnaire');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('questionnaire.editor', 'editor')
      .leftJoinAndSelect(
        'questionnaire.questionnaireSections',
        'questionnaireSections',
      )
      .leftJoinAndSelect('questionnaireSections.questions', 'questions');

    // Use OR to match either customer or provider userID
    // queryBuilder.where('questionnaire.searchTerms = :searchTerms', {
    //   searchTerms,
    // });

    // Execute the query and return the results
    const exhibit = await queryBuilder.getMany();

    console.log('@exhibit', exhibit);
    return exhibit;
  }
  async findOneQuestionnaireByID(id:string): Promise<Questionnaire> {
    const queryBuilder =
      this.questionnaireRepository.createQueryBuilder('questionnaire');
    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('questionnaire.editor', 'editor')
      .leftJoinAndSelect(
        'questionnaire.questionnaireSections',
        'questionnaireSections',
      )
      .leftJoinAndSelect('questionnaireSections.questions', 'questions');

    // Use OR to match either customer or provider userID
    queryBuilder.where('questionnaire.id = :id', {
      id,
    });
    // Execute the query and return the results
    const questionnaire = await queryBuilder.getOne();
    console.log('@questionnaire', questionnaire);
    return questionnaire;
  }
  async findOneQuestionnaire(id: string): Promise<Questionnaire> {
    const queryBuilder =
      this.questionnaireRepository.createQueryBuilder('questionnaire');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('questionnaire.editor', 'editor')
      .leftJoinAndSelect(
        'questionnaire.questionnaireSections',
        'questionnaireSections',
      );

    // Use OR to match either customer or provider userID
    queryBuilder.where('questionnaire.id = :id', {
      id,
    });

    // Execute the query and return the results
    const questionnaire = await queryBuilder.getOne();

    console.log('@questionnaire', questionnaire);
    return questionnaire;
  }
  async getAllQuestionnaireSections(): Promise<QuestionnaireSection[]> {
    const queryBuilder =
      this.questionnaireSectionRepository.createQueryBuilder('section');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('section.exhibits', 'exhibits')
      .leftJoinAndSelect('section.questions', 'questions')
      .leftJoinAndSelect('section.questionnaires', 'questionnaires');

    // Execute the query and return the results
    const questionnaire = await queryBuilder.getMany();

    console.log('@questionnaire', questionnaire);
    return questionnaire;
  }
  async findOneQuestionnaireSection(id: string): Promise<QuestionnaireSection> {
    const queryBuilder =
      this.questionnaireSectionRepository.createQueryBuilder('section');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('section.exhibits', 'exhibits')
      .leftJoinAndSelect('section.questions', 'questions')
      .leftJoinAndSelect('section.questionnaires', 'questionnaires');

    // Use OR to match either customer or provider userID
    queryBuilder.where('section.id = :id', {
      id,
    });

    // Execute the query and return the results
    const questionnaire = await queryBuilder.getOne();

    console.log('@questionnaire', questionnaire);
    return questionnaire;
  }
  async NextQuestionnaireSection(id: string): Promise<QuestionnaireSection> {
    const queryBuilder =
      this.questionnaireSectionRepository.createQueryBuilder('section');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('section.questions', 'questions');

    // Use OR to match either customer or provider userID
    queryBuilder.where('section.id = :id', {
      id,
    });

    // Execute the query and return the results
    const questionnaire = await queryBuilder.getOne();

    console.log('@questionnaire', questionnaire);
    return questionnaire;
  }
  async findAccountExhibits(userID: string): Promise<Exhibit[]> {
    const queryBuilder = this.exhibitRepository.createQueryBuilder('exhibit');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('exhibit.editor', 'editor')
      .leftJoinAndSelect('exhibit.client', 'client')
      .leftJoinAndSelect('exhibit.questions', 'questions')
      .leftJoinAndSelect('exhibit.questionnaire', 'questionnaire')
      .leftJoinAndSelect(
        'questionnaire.questionnaireSections',
        'questionnaireSections',
      );

    // Use OR to match either customer or provider userID
    queryBuilder.where('client.userID = :userID', {
      userID,
    });

    // Execute the query and return the results
    const exhibit = await queryBuilder.getMany();

    console.log('@exhibit', exhibit);
    return exhibit;
  }
  async findAllExhibits(): Promise<Exhibit[]> {
    const queryBuilder = this.exhibitRepository.createQueryBuilder('exhibit');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('exhibit.editor', 'editor')
      .leftJoinAndSelect('exhibit.client', 'client')
      .leftJoinAndSelect('exhibit.questions', 'questions')
      .leftJoinAndSelect('exhibit.questionnaire', 'questionnaire')
      .leftJoinAndSelect(
        'questionnaire.questionnaireSections',
        'questionnaireSections',
      );

    // Use OR to match either customer or provider userID

    // Execute the query and return the results
    const exhibit = await queryBuilder.getMany();

    console.log('@exhibit', exhibit);
    return exhibit;
  }
  async findOneExhibit(id: string): Promise<Exhibit> {
    const queryBuilder = this.exhibitRepository.createQueryBuilder('exhibit');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('exhibit.editor', 'editor')
      .leftJoinAndSelect('exhibit.client', 'client')
      .leftJoinAndSelect('exhibit.questions', 'questions')
      .leftJoinAndSelect('exhibit.questionnaire', 'questionnaire');

    // Use OR to match either customer or provider userID
    queryBuilder.where('exhibit.id = :id', {
      id,
    });

    // Execute the query and return the results
    const exhibit = await queryBuilder.getOne();

    console.log('@exhibit', exhibit);
    return exhibit;
  }

  async update(id: string, updateQuestionDto: QuestionDto): Promise<Question> {
    await this.questionRepository.update(id, updateQuestionDto);
    return this.questionRepository.findOne({
      where: { id: id },
      relations: ['questionnaires'],
    });
  }

  async remove(id: number): Promise<void> {
    await this.questionRepository.delete(id);
  }
}
