import { User } from '../../users/entities/user.entity';
import { Editor } from '../entities/beetroot-service.entity';
import { Questionnaire } from '../entities/questionaire.entity';

// DTO for ExhibitQuestionaire
export class Questionnairedto {
  questionnaireSectionID?: string;
  questionnaireID?:string;
  category?: string;
  searchTerms?: string;
  title?: string;
  body?: string;
  editor?: Editor; // Assuming you have a User DTO
  questions?: [];
}
export class QuestionnaireSectionDto {
  questionnaireID?: string;
  questionnaireSectionID?: string;
  title?: string;
  questions?: [];
}

export class ExhibitSocketPayloadDTO {
  questionnaireID:string;
  clientAuth: string;
  status: string;
  payload: string
  bookingType: string;
  questionnaireSectionID: string;
  clientID: string;
}
export class ExhibitSectionDto {
  exhibitID?: string;
  title?: string;
  questions?: [];
}
// DTO for ExhibitQuestionaire
export class ExhibitQuestionairedto {
  authToken?: string;
  questionnaire?: Questionnaire;
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
