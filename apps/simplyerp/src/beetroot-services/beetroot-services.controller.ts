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
  Questionnairedto,
} from './dto/exhibitQuestion.dto';
import { Questionnaire } from './entities/questionaire.entity';

@Controller('beetroot-controller')
export class BeetrootServicesController {
  constructor(private readonly questionService: QuestionService) {}
  @Get('exhibitsFolder/:fileId')
  async serveOfferItemImage(@Param('fileId') fileId, @Res() res): Promise<any> {
    res.sendFile(fileId, { root: './uploadedFiles/exhibitsFolder' });
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
    const questionaire: Questionnaire = req['answeredQuestionnaire'];
    // console.log('questionaire', questionaire);
    const authToken = req['authToken'];
    return this.questionService.createExhibit(
      authToken,
      questionaire,
      files,
    );
  }
}
