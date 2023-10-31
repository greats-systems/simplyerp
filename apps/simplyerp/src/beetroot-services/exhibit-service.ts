import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question, Questionnaire } from './entities/questionaire.entity';
import { QuestionDto, Questionnairedto } from './dto/exhibitQuestion.dto';
var WPAPI = require( 'wpapi/superagent' );
var wp = new WPAPI({ endpoint: 'http://beetroot.today/wp-json' });

@Injectable()
export class ExhibitService {
    constructor(
        @InjectRepository(Questionnaire)
        private exhibitQuestionaireRepository: Repository<Questionnaire>,
        @InjectRepository(Question)
        private exhibitQuestionRepository: Repository<Question>,
    ){}    

  async createQuestionnaire(exhibitQuestionaireData: Questionnairedto): Promise<Questionnaire> {
    let questions = [];
    const exhibitQuestionaire = new Questionnaire();
    exhibitQuestionaire.title = exhibitQuestionaireData.title;
    exhibitQuestionaire.category = exhibitQuestionaireData.category;
    exhibitQuestionaire.editor = exhibitQuestionaireData.editor;
    exhibitQuestionaire.searchTerms = exhibitQuestionaireData.searchTerms;
    if (exhibitQuestionaireData.questions) {
      await Promise.all(
        exhibitQuestionaireData.questions.map(async (qsn: string) => {
          const question: QuestionDto = {
            category:  exhibitQuestionaireData.title,
            searchTerms: exhibitQuestionaireData.searchTerms,
            question: qsn,
            publisher:exhibitQuestionaireData.editor,
            questionnaireIds: [exhibitQuestionaire.id]
          };
          const newQuestion = await this.createQuestion(question);

          questions.push(newQuestion);
        }),
      );

    }
    const updatedQuestionnaire = await this.exhibitQuestionaireRepository.save(exhibitQuestionaire);
    console.log(' updatedQuestionnaire', exhibitQuestionaire);
    return updatedQuestionnaire;

  }
  async getPosts(): Promise<any> {
    try {
      const posts = await wp.posts().get();
      console.log('recived posts', posts)
      return posts 
    } catch (error) {
      return;
    }    
  }

  async updateQuestionnaire(id: string, exhibitQuestionaireData: Questionnairedto): Promise<Questionnaire | null> {
    await this.exhibitQuestionaireRepository.update(id, exhibitQuestionaireData);
    const updatedQuestionnaire = await this.exhibitQuestionaireRepository.findOne({where:{id: id}});
    return updatedQuestionnaire || null;
  }

  async deleteQuestionnaire(id: string): Promise<void> {
    await this.exhibitQuestionaireRepository.delete(id);
  }
  // CRUD methods for Question


  async createQuestion(exhibitQuestionData: QuestionDto): Promise<Question> {
    const exhibitQuestion = this.exhibitQuestionRepository.create(exhibitQuestionData);

    await this.exhibitQuestionRepository.save(exhibitQuestion);
    return exhibitQuestion;
  }

  async getQuestionById(id: string): Promise<Question | null> {
    const exhibitQuestion = await this.exhibitQuestionRepository.findOne({where:{id: id}});
    return exhibitQuestion || null;
  }

  async updateQuestion(id: string, exhibitQuestionData: QuestionDto): Promise<Question | null> {
    await this.exhibitQuestionRepository.update(id, exhibitQuestionData);
    const updatedQuestion = await this.exhibitQuestionRepository.findOne({where:{id: id}});
    return updatedQuestion || null;
  }

  async deleteQuestion(id: string): Promise<void> {
    await this.exhibitQuestionRepository.delete(id);
  }
}



