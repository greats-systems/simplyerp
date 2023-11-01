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
import { Exhibit, QuestionAnswer, Responses } from './entities/exhibit.entity';
// import SearchService from '../search/search.service';
import { User } from '../users/entities/user.entity';
import { SalesOrdersService } from '../sales-orders/sales-orders.service';

@Injectable()
export class MigrationService {
  constructor(
    @InjectRepository(Questionnaire)
    private readonly questionnaireRepository: Repository<Questionnaire>,
    @InjectRepository(QuestionAnswer)
    private readonly questionAnswerRepository: Repository<QuestionAnswer>,
    @InjectRepository(Responses)
    private readonly ResponsesRepository: Repository<Responses>,
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

  async getRandomUser(): Promise<User> {
    const users = await this.usersService.findAll();
    const randomIndex = Math.floor(Math.random() * users.length);
    return users[randomIndex];
  }
  async runMigrations(){
    await this.populateDatabaseWitQuestionAndAnswers();
    await this.populateDatabaseWithUserData();
  }

  async  populateDatabaseWitQuestionAndAnswers() {
    const questionsAndAnswers = [
      {
        question: 'As a startup in South Africa, what are the requirements for applying for a business loan?',
        answers: [
          'A detailed business plan, a good credit history, suretyship and loan security and financial statements.',
          'Depending on where you apply for the business loan the requirements will vary...',
          'Depending on your business stage, it is easier for smaller companies to apply for loans...',
        ],
      },
      {
        question: 'I am building an app and I was wondering how can I, as a tech-entrepreneur, distinguish myself in this crowded marketplace?',
        answers: [
          'Creating a unique product or service definitely helps. Build a strong brand identity and make use of unique marketing...',
          'Standing out in a crowded marketplace isn\'t just about being different; it\'s about being better in a way that matters to your customers...',
        ],
      },
      {
        question: 'When should I apply for a startup accelerator program?',
        answers: [
          'You should be preparing to launch your product or have recently launched.',
          'Questions you should ask yourself before applying for a startup acceleration program; does my startup have a minimum viable product...',
        ],
      },
      {
        question: 'How can I market my business / small business?',
        answers: [
          'Socials might be the best and most cost-effective way to market your business...',
          'Effectively marketing a small business involves a combination of strategies and tactics...',
        ],
      },
      {
        question: 'How can I improve my customer retention rates?',
        answers: [
          'Improve customer support by having a live chat option on your website...',
          'Offer a discount on a customer’s first purchase and ask customers to provide feedback...',
        ],
      },
      {
        question: 'How do I know if I am partnering with the right person?',
        answers: [
          'A good business partner will have skills that complement your own. They should be reliable...',
          'Take your time to thoroughly evaluate the potential partner. Consider the following questions...',
        ],
      },
      {
        question: 'How did you raise capital for your business?',
        answers: [
          'My friend helped me, she cut me a check in exchange for equity.',
        ],
      },
      {
        question: 'How did you manage to ignore negativity from your close friends and friends when you ventured into entrepreneurship?',
        answers: [
          'By connecting with other entrepreneurs. It helps to have someone to talk to that understands the difficulties and stresses...',
          'Reminding myself of my why and realizing that I am the only person who needs to understand what I am doing.',
        ],
      },
    ];
  
    for (const qa of questionsAndAnswers) {
      const questionner = await this.getRandomUser();
  
      // Create the question
      const questionAnswer = new QuestionAnswer();
      questionAnswer.questionner = questionner;
      questionAnswer.question = qa.question;
  
      // Create the answers
      let responses = []
      await Promise.all( qa.answers.map(async (answerText) => {
        const commenter = await this.getRandomUser();
        const response = new Responses();
        response.commenter = commenter;
        response.comment = answerText;
        responses.push(response);
      }));
  
      questionAnswer.responses = responses;
      // Save the question and associated answers to the database
      return this.questionAnswerRepository.save(questionAnswer);
    }
  }

  async  populateDatabaseWithUserData() {
    console.log('....populateDatabaseWithUserData')
   const usrs =  await this.usersService.populateDatabaseWithUserData();
   return usrs;
  }
  
}
