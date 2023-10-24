// question.service.ts
import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ExhibitImage,
  Question,
  Questionnaire,
} from './entities/questionaire.entity';
import {
  ExhibitQuestionairedto,
  QuestionDto,
  Questionnairedto,
} from './dto/exhibitQuestion.dto';
import { UsersService } from '../users/users.service';
import { ExhibitService } from './exhibit-service';
import { Exhibit } from './entities/exhibit.entity';
import SearchService from '../search/search.service';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Questionnaire)
    private readonly questionnaireRepository: Repository<Questionnaire>,
    @InjectRepository(Exhibit)
    private readonly exhibitRepository: Repository<Exhibit>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(ExhibitImage)
    private readonly exhibitImageRepository: Repository<ExhibitImage>,
    private usersService: UsersService,
    private searchService: SearchService,
  ) {}

  async findAll(): Promise<Question[]> {
    return this.questionRepository.find({ relations: ['questionnaires'] });
  }

  async findOne(id: string): Promise<Question> {
    return this.questionRepository.findOne({
      where: { id: id },
      relations: ['questionnaires'],
    });
  }

  async create(createQuestionDto: Questionnairedto): Promise<Questionnaire> {
    const { ...questionData } = createQuestionDto;
    console.log('@questionData', questionData);

    let qsnaires = [];
    let qsns = [];
    const qsnaire = new Questionnaire();
    qsnaire.title = questionData.title;
    qsnaire.category = questionData.category;
    qsnaire.searchTerms = questionData.searchTerms;
    const newQnaire = await this.questionnaireRepository.save(qsnaire);
    qsnaires.push(newQnaire);
    console.log('newQnaire', newQnaire);
    if (questionData.questions.length > 0) {
      await Promise.all(
        questionData.questions.map(async (q: string) => {
          if (q !== '') {
            const question = new Question();
            question.question = q;
            question.category = questionData.category;
            question.searchTerms = questionData.searchTerms;
            question.questionnaires = qsnaires;
            const qsn = await this.questionRepository.save(question);
            console.log('qsn', qsn);
            qsns.push(qsn);
          }
        }),
      );
    }
    newQnaire.questions = qsns;
    await this.questionnaireRepository.save(newQnaire);
    const updateQnaire = await this.questionnaireRepository.findOne({
      where: { id: newQnaire.id },
      relations: { questions: true },
    });
    console.log('updateQnaire', updateQnaire);
    return updateQnaire;
  }
  async createExhibit(
    authToken: string,
    questionnaire: Questionnaire,
    files: any,
  ): Promise<any> {
    const { ...questionData } = questionnaire;
    console.log('@questionData', questionData);

    let qsns = [];

    const client = await this.usersService.decodeUserToken(authToken);
    const exhibitInstance = new Exhibit();
    exhibitInstance.client = client;
    exhibitInstance.editor = questionData.editor;
    exhibitInstance.questionnaire = questionData;
    // exhibitInstance.questions = questionData.questions;
    // const newExhibit = await this.exhibitRepository.save(exhibitInstance);
    // console.log('newExhibit', newExhibit);
    if (questionData.questions.length > 0) {
      await Promise.all(
        questionData.questions.map(async (q: Question) => {
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
    const indexed = await this.searchService.indexExhibit(indexExhibit);
    console.log('indexed', indexed);

    return {
      status: 200,
      data: JSON.stringify(getExhibit),
      error: null,
      errorMessage: null,
      successMessage: 'success',
    };
  }
  async findAllQuestions(): Promise<Question[]> {
    const queryBuilder =
      this.questionRepository.createQueryBuilder('question');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('question.editor', 'editor')
      .leftJoinAndSelect('question.questions', 'questions')

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
    const queryBuilder =
      this.questionRepository.createQueryBuilder('question');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('question.editor', 'editor')
      .leftJoinAndSelect('question.question', 'question')

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
      .leftJoinAndSelect('questionnaire.questions', 'questions')

    // Use OR to match either customer or provider userID
    // queryBuilder.where('questionnaire.searchTerms = :searchTerms', {
    //   searchTerms,
    // });

    // Execute the query and return the results
    const exhibit = await queryBuilder.getMany();

    console.log('@exhibit', exhibit);
    return exhibit;
  }

  async findOneQuestionnaire(id: string): Promise<Questionnaire> {
    const queryBuilder =
      this.questionnaireRepository.createQueryBuilder('questionnaire');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('questionnaire.editor', 'editor')
      .leftJoinAndSelect('questionnaire.questions', 'questions')

    // Use OR to match either customer or provider userID
    queryBuilder.where('questionnaire.id = :id', {
      id,
    });

    // Execute the query and return the results
    const questionnaire = await queryBuilder.getOne();

    console.log('@questionnaire', questionnaire);
    return questionnaire;
  }

  async findAccountExhibits(userID: string): Promise<Exhibit[]> {
    const queryBuilder =
      this.exhibitRepository.createQueryBuilder('exhibit');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('exhibit.editor', 'editor')
      .leftJoinAndSelect('exhibit.client', 'client')
      .leftJoinAndSelect('exhibit.questions', 'questions')
      .leftJoinAndSelect('exhibit.questionnaire', 'questionnaire')
      .leftJoinAndSelect('questionnaire.questions', 'questionnaire_questions');

    // Use OR to match either customer or provider userID
    queryBuilder.where('client.userID = :userID', {
      userID,
    });

    // Execute the query and return the results
    const exhibit = await queryBuilder.getMany();

    console.log('@exhibit', exhibit);
    return exhibit;
  }

  async findOneExhibit(id: string): Promise<Exhibit> {
    const queryBuilder =
      this.exhibitRepository.createQueryBuilder('exhibit');

    // Join with the Customer and Vendor relations
    queryBuilder
      .leftJoinAndSelect('exhibit.editor', 'editor')
      .leftJoinAndSelect('exhibit.client', 'client')
      .leftJoinAndSelect('exhibit.questions', 'questions')
      .leftJoinAndSelect('exhibit.questionnaire', 'questionnaire')
      .leftJoinAndSelect('questionnaire.questions', 'questionnaire_questions');

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
