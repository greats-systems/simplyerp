import { User } from "../../users/entities/user.entity";
import { Editor } from "../entities/beetroot-service.entity";
import { Questionnaire } from "../entities/questionaire.entity";

// DTO for ExhibitQuestionaire
export class Questionnairedto {
    category?: string;
    searchTerms?: string;
    title?: string;
    body?: string;
    editor?: Editor; // Assuming you have a User DTO
    questions?: []
  }
  
  // DTO for ExhibitQuestionaire
export class ExhibitQuestionairedto {
  authToken?: string;
  questionnaire?: Questionnaire
}

  // DTO for ExhibitQuestion
  export class QuestionDto {
    category: string;
    question: string;
    meta?: string;
    searchTerms?: string;
    title?: string;
    body?: string;
    editor?: User;
    publisher: Editor; // Assuming you have a User DTO
    questionnaireIds: string[];
  }
  

