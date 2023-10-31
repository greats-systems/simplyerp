import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Res,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';

import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RequestWithNewService } from '../users/dto/requestWithUser.interface';
import { QuestionService } from './question-service';
import {
  ExhibitQuestionairedto,
  QuestionnaireSectionDto,
  Questionnairedto,
} from './dto/exhibitQuestion.dto';
import {
  Questionnaire,
  QuestionnaireSection,
} from './entities/questionaire.entity';
import { ExhibitService } from './exhibit-service';

@Controller('beetroot')
export class BeetrootServicesController {
  constructor(private readonly questionService: QuestionService,     private readonly exhibitServiceService: ExhibitService,
    ) {}
  @Get('exhibitsFolder/:fileId')
  async serveOfferItemImage(@Param('fileId') fileId, @Res() res): Promise<any> {
    res.sendFile(fileId, { root: './uploadedFiles/exhibitsFolder' });
  }
  @Post('create-questionnaire')
  async saveQuestionnaire(@Body() createQuestionDto: Questionnairedto) {
    console.log('get-exhibits',createQuestionDto );
    const questionnaire = await this.questionService.createQuestionnaire(createQuestionDto);
    if (questionnaire) {
      const successData = {
        status: 200,
        data: JSON.stringify({ questionnaire: questionnaire }),
        error: null,
        errorMessage: null,
        successMessage: 'success',
      };
      console.log('saveQuestionnaire successData', successData);

      return successData;
    }
    return null;
  }
// save-questionnaire-section-questions
@Post('save-questionnaire-section-questions')
async saveQuestionnaireSectionQuestions(@Body() createQuestionDto: QuestionnaireSectionDto) {
  console.log('get-exhibits',createQuestionDto );
  const section = await this.questionService.saveQuestionnaireSectionQuestions(createQuestionDto);
  if (section) {
    console.log('@Post section', section);
    const successData = {
      status: 200,
      data: JSON.stringify({section:section}),
      error: null,
      errorMessage: null,
      successMessage: 'success',
    };
    console.log('saveQuestionnaire section', successData);

    return successData;
  }
  return null;
}
  @Post('submit-exhibit-for-review')
  @UseInterceptors(
    FilesInterceptor('file', 5, {
      storage: diskStorage({
        destination: './uploadedFiles/exhibitsFolder',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(
            null,
            `${randomName}${extname(file.originalname + '.jpeg')}`,
          );
        },
      }),
    }),
  )
  async submitExhibitForReview(
    @Req() request: RequestWithNewService,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    console.log('submitExhibitForReview request.body', request.body);
    // const req:ExhibitQuestionairedto = request.body;
    const req = JSON.parse(request.body['exhibit-for-review']);
    const questionnaireSection: QuestionnaireSectionDto =
      req['answeredQuestionnaireSection'];
    // console.log('questionaire', questionaire);
    const authToken = req['authToken'];
    return this.questionService.createExhibit(
      authToken,
      questionnaireSection.questionnaireID,
    );
  }

  
  @Post('get-questionnaire-sections')
  async getQuestionnaireSections(@Body() serviceToken) {
    console.log('get-questionnaires', serviceToken);
    const sections =
      await this.questionService.getAllQuestionnaireSections();
    if (sections) {
      const successData = {
        status: 200,
        data: JSON.stringify({ sections: sections }),
        error: null,
        errorMessage: null,
        successMessage: 'success',
      };
      console.log('getQuestionnaires successData', successData);

      return successData;
    }
    return null;
  }
  @Post('get-questionnaires')
  async getUserByToken(@Body() serviceToken) {
    console.log('get-questionnaires', serviceToken);
    const accountQuestionnaires =
      await this.questionService.findAllQuestionnaires();
    if (accountQuestionnaires) {
      const successData = {
        status: 200,
        data: JSON.stringify({ questionnaires: accountQuestionnaires }),
        error: null,
        errorMessage: null,
        successMessage: 'success',
      };
      console.log('getQuestionnaires successData', successData);

      return successData;
    }
    return null;
  }
  @Post('get-exhibits')
  async getExhibits(@Body() serviceToken) {
    console.log('get-exhibits', serviceToken);
    const exhibits = await this.questionService.findAllExhibits();
    if (exhibits) {
      const successData = {
        status: 200,
        data: JSON.stringify({ exhibits: exhibits }),
        error: null,
        errorMessage: null,
        successMessage: 'success',
      };
      console.log('getQuestionnaires successData', successData);

      return successData;
    }
    return null;
  }
  
  @Get('get-posts')
  async getPosts() {
    console.log('getPosts');
    const posts = await this.exhibitServiceService.getPosts();
    console.log('getPosts rsp');
    if (posts) {
      const successData = {
        status: 200,
        data: JSON.stringify({ posts: posts }),
        error: null,
        errorMessage: null,
        successMessage: 'success',
      };
      console.log('getQuestionnaires successData', successData);

      return successData;
    }
    return null;
  }
  @Post('get-entreprenuers')
  async getEntreprenuers(@Body() serviceToken) {
    console.log('get-entreprnuers', serviceToken);
    const accountQuestionnaires = await this.questionService.getEntreprenuers();
    if (accountQuestionnaires) {
      const successData = {
        status: 200,
        data: JSON.stringify({ entreprenuers: accountQuestionnaires }),
        error: null,
        errorMessage: null,
        successMessage: 'success',
      };
      console.log('getEntreprenuers successData', successData);

      return successData;
    }
    return null;
  }
  @Post('save-interview')
  async saveInterview(@Body() exhibitQuestionaire) {
    console.log('save-interview', exhibitQuestionaire);

    const editorExhibit = await this.questionService.saveEditorExhibitResponses(
      exhibitQuestionaire['editorAuthToken'],
      exhibitQuestionaire['questionnaireID'],
      exhibitQuestionaire['intervieweeID'],
      exhibitQuestionaire['questions'],
    );
    if (editorExhibit) {
      const successData = {
        status: 200,
        data: JSON.stringify({ editorExhibit: editorExhibit }),
        error: null,
        errorMessage: null,
        successMessage: 'success',
      };
      console.log('saveInterview successData', successData);

      return successData;
    }
    return 'null';
  }
}
