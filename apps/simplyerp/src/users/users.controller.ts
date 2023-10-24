import { Body, Controller, Get, Param, Post, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import RequestWithUser from './dto/requestWithUser.interface';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('users')
export class UsersController {
    constructor(
      private readonly usersService: UsersService,
      ) {}
      @Post('update-user-profile')
      async updateUserProrfileByID(@Body() data) {
          const userProfile = await this.usersService.updateUserProrfileByID(data);
          console.log('updateUserProrfileByID userProfile', userProfile);
          if (userProfile) {
            const successData = {
              status: 200,
              data: JSON.stringify(userProfile),
              error: null,
              errorMessage: null,
              successMessage: 'success',
            };
            return successData;
          } else {
            console.log('Error fetching userProfile', { error: true });
            return {
              status: 404,
              data: null,
              error: true,
              errorMessage: 'Error fetching userProfile',
              successMessage: 'failed',
            };
          }
      }
    @Get('avatars/:fileId')
    async serveAvatar(@Param('fileId') fileId, @Res() res): Promise<any> {
      res.sendFile(fileId, { root: 'uploadedFiles/avatars'});
    }

    @Post('avatar')
    // @UseGuards(JwtAuthenticationGuard)
    @UseInterceptors(FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploadedFiles/avatars',
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
          return cb(null, `${randomName}${extname(file.originalname)}`)
        }
      })
    }))
    async addAvatar(@Req() request: RequestWithUser, @UploadedFile() file: Express.Multer.File) {
        console.log('addAvatar request request',request)
        const newUser = await this.usersService.decodeUserToken(request.headers.cookie);
        console.log('authenticationService.decodeUserToken user', newUser)      
        return this.usersService.addAvatar(newUser.userID, {
        path: file.path,
        filename: file.filename,
        mimetype: file.mimetype
      });
    }

    @Post('add-employee')
    // @UseGuards(JwtAuthenticationGuard)
    @UseInterceptors(FilesInterceptor('file', 5, {
      storage: diskStorage({
        destination: './uploadedFiles/avatars',
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
          return cb(null, `${randomName}${extname(file.originalname+'.jpeg')}`)
        }

      })
    }))

    @Post('getUserByID')
    getUserByID(@Body() data) {
        console.log('getUserByID')
        console.log(data)
        return this.usersService.getUserByID(data.userID);
    }
    @Get('get-users')
    getUsers() {
        console.log('getting users')
        return this.usersService.getAllClients();
    }
    @Get('getClientsList')
    getAllClients() {
      return this.usersService.getAllClients();
    }


    @Post('get-requested-service-providers')
    getServiceProviders(@Body() data) {
        console.log('get Service Providers')
        console.log(data)
        return this.usersService.getServiceProviders(data);
    }
    
}
