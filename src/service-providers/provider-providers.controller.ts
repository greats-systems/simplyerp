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
import { RequestWithNewService } from 'src/users/dto/requestWithUser.interface';
import { ServiceProvidersService } from './service-providers.service';
import { CreateCatalogDTO } from './dto/create-catalog-dto';
import { CreateFirebaseAuthUserDTO } from './dto/firebase-account.dto';

@Controller('service-providers')
export class ServiceProvidersController {
  constructor(private readonly providerAdminService: ServiceProvidersService) {}
  @Get('serviceFolder/:fileId')
  async serveOfferItemImage(@Param('fileId') fileId, @Res() res): Promise<any> {
    res.sendFile(fileId, { root: './uploadedFiles/serviceFolder' });
  }

  @Post('fetch-account-data')
  async fetchAccountData(@Body() firebaseAuthUser: CreateFirebaseAuthUserDTO) {
    // console.log('fetch-account-dataa', firebaseAuthUser);
    if (firebaseAuthUser.uid !== null) {
      const provider =
        await this.providerAdminService.findServiceProviderAccountByFirebaseAuthID(
          firebaseAuthUser,
        );
      if (provider) {
        // // console.log('getProvider Account', provider);
        // const successData = {
        //   status: 200,
        //   data: JSON.stringify(provider),
        //   error: null,
        //   errorMessage: null,
        //   successMessage: 'success',
        // };
        return provider;
      }
    } 
    return {
        status: 404,
        data: null,
        error: true,
        errorMessage: 'Error fetching account',
        successMessage: 'failed',
      };
    
  }
  @Post('update-provider-profile')
  async updateServiceProviderProfileByID(
    @Body() firebaseAuthUser: CreateFirebaseAuthUserDTO,
  ) {
    console.log('update-provider-prorfile', firebaseAuthUser);
    if (firebaseAuthUser.uid !== null) {
      try {
        const profile =
          await this.providerAdminService.updateServiceProviderProfileByID(
            firebaseAuthUser,
          );
        console.log('getAccountProfile', profile);
        if (profile) {
          const successData = {
            status: 200,
            data: JSON.stringify(profile),
            error: null,
            errorMessage: null,
            successMessage: 'success',
          };
          return successData;
        }
      } catch (error) {
        console.log('update-provider-profile failed', error);
        return {
          status: 404,
          data: null,
          error: JSON.stringify(error),
          errorMessage: 'Error fetching account',
          successMessage: 'failed',
        };
      }
    }
    console.log('update-provider-profile failed');
    return {
      status: 404,
      data: null,
      error: true,
      errorMessage: 'Error fetching account',
      successMessage: 'failed',
    };
  }

  @Post('create-new-catalog')
  createNewCatelog(@Body() CreateCatalogDTO: CreateCatalogDTO) {
    console.log('Post-account-catalogs');

    return this.providerAdminService.createNewCatelog(CreateCatalogDTO);
  }
  @Get('get-catalog/:catalogID')
  async getCatelog(@Param('catalogID') catalogID, @Res() res) {
    console.log('Get-catalog', catalogID);
    const catalog = await this.providerAdminService.getCatelogByID(catalogID);
    if (catalog) {
      const successData = {
        status: 200,
        data: JSON.stringify(catalog),
        error: null,
        errorMessage: null,
        successMessage: 'success',
      };
      console.log('getAccountCatelog successData', successData);

      return successData;
    }
    return null;
  }

  @Get('get-portfolio/:catalogID')
  async getPortfolio(@Param('portfolioID') catalogID, @Res() res) {
    console.log('Get-portfolio', catalogID);
    const catalog = await this.providerAdminService.getCatelogByID(catalogID);
    if (catalog) {
      const successData = {
        status: 200,
        data: JSON.stringify(catalog),
        error: null,
        errorMessage: null,
        successMessage: 'success',
      };
      console.log('getAccountCatelog successData', successData);

      return successData;
    }
    return null;
  }
  @Get('get-account-catalogs/:authToken')
  async getAccountCatelog(@Param('authToken') authToken, @Res() res) {
    console.log('Get-account-catalogs', authToken);
    const accountCatalogs =
      await this.providerAdminService.getCatelogsByAccountID(authToken);
    if (accountCatalogs) {
      const successData = {
        status: 200,
        data: JSON.stringify(accountCatalogs),
        error: null,
        errorMessage: null,
        successMessage: 'success',
      };
      console.log('getAccountCatelog successData', successData);

      return successData;
    }
    return null;
  }

  @Post('update-service')
  // @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(
    FilesInterceptor('file', 5, {
      storage: diskStorage({
        destination: './uploadedFiles/serviceFolder',
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
  async updateProfessionalService(
    @Req() request: RequestWithNewService,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    console.log(
      'addNewServiceImages NewService request',
      request.body['service-item'],
    );
    const req = JSON.parse(request.body['service-item']);
    console.log('addNewServiceImages NewService', req);
    return this.providerAdminService.updateBeautyService(req, files);
  }
  @Post('add-new-service')
  // @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(
    FilesInterceptor('file', 5, {
      storage: diskStorage({
        destination: './uploadedFiles/serviceFolder',
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
  async addNewProfessionalService(
    @Req() request: RequestWithNewService,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    console.log(
      'addNewProfessionalService NewService request',
      request.body['service-item'],
    );
    const req = JSON.parse(request.body['service-item']);
    console.log('addNewProfessionalService NewService', req);
    return this.providerAdminService.addNewService(req, files);
  }

  @Post('create-new-service')
  @UseInterceptors(
    FilesInterceptor('file', 5, {
      storage: diskStorage({
        destination: './uploadedFiles/serviceFolder',
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
  async createProfessionalService(
    @Req() request: RequestWithNewService,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    console.log(
      'createProfessionalService request.body',
      request.body,
    );
    const req = request.body;
    console.log('addNewProfessionalService NewService', req);
    return this.providerAdminService.createNewProfessionalService(req, files);
  }
}
