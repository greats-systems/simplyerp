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
import { ServiceProvidersService } from './service-providers.service';
import { CreateCatalogDTO } from './dto/create-catalog-dto';
import { CreateFirebaseAuthUserDTO } from './dto/firebase-account.dto';
import { BeautyServiceService } from './beauty_service.service';
import { CreateServiceProviderDto } from './dto/create-service-provider.dto';

@Controller('service-providers')
export class ServiceProvidersController {
  constructor(private readonly providerAdminService: ServiceProvidersService, private readonly beautyService: BeautyServiceService) {}
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
  // @Post('create-provider-profile')
  // async createServiceProviderProfileByID(
  //   @Body() createServiceProviderDto: CreateServiceProviderDto,
  // ) {
  //   console.log('update-provider-prorfile', createServiceProviderDto);
  //   if (createServiceProviderDto.userID !== null) {
  //     try {
  //       const authenticatedUser = await this.usersService.getUserFromAuthToken(
  //         createCatalogDTO.authToken,
  //       );
  //       console.log(
  //         'authenticationService decodeUserToken user',
  //         authenticatedUser,
  //       );
  //       let manager: ServiceProvider;
  //       if (createCatalogDTO.managerUserID) {
  //         manager = await this.serviceProvidersService.findServiceProviderByuserId(
  //           createCatalogDTO.managerUserID,
  //         );
  //       } else {
  //         manager = await this.serviceProvidersService.findServiceProviderByuserId(
  //           authenticatedUser.userID,
  //         );
  //       }
  //       if (authenticatedUser && !manager) {
  //         manager = await this.serviceProvidersService.createNewServiceProvider(authenticatedUser);
  //       }
  //     } catch (error) {
  //       console.log('update-provider-profile failed', error);
  //       return {
  //         status: 404,
  //         data: null,
  //         error: JSON.stringify(error),
  //         errorMessage: 'Error fetching account',
  //         successMessage: 'failed',
  //       };
  //     }
  //   }
  //   console.log('update-provider-profile failed');
  //   return {
  //     status: 404,
  //     data: null,
  //     error: true,
  //     errorMessage: 'Error fetching account',
  //     successMessage: 'failed',
  //   };
  // }
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
    return this.beautyService.createNewCatelog(CreateCatalogDTO);
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
  @Post('add-new-beauty_service')
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
  async addBeautyService(
    @Req() request: RequestWithNewService,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    console.log(
      'addBeautyService request',
      request.body['service-item'],
    );
    const req = JSON.parse(request.body['service-item']);
    console.log('addBeautyService NewService', req);
    return this.beautyService.addBeautyService(req, files);
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
