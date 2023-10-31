import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { UsersService } from '../../users/users.service';
import { CreateUserDTO } from '../../users/dto/create-user.input';
import { LoginUserDTO, VerifyOTPDTO } from '../../users/dto/login-user.input';
import { ApiBody, ApiResponse } from '@nestjs/swagger';

@Controller('authentication')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('signup')
  @ApiResponse({ status: 201, description: 'The record has been successfully created.'})
  @ApiResponse({ status: 403, description: 'Forbidden.'})
  @ApiBody({
     type: CreateUserDTO,
     description: 'Json structure for user object',
  })
  enrollUser(@Body() createUserDTO: CreateUserDTO) {
    return this.usersService.onHandleSignUp(createUserDTO);
  }

  @Post('login')
  async login(@Body() loginUserDTO: LoginUserDTO) {
    let response = await this.authService.loginUser(loginUserDTO);
    console.log('signin response');
    console.log(response);
    return response;
  }

  @Post('signin')
  async signin(@Body() loginData) {
    let response = await this.authService.generateOTP(loginData.phone);
    console.log('signin response');
    console.log(response);
    return response;
  }

  @Post('get-user')
  getUserByToken(@Body() serviceToken) {
    console.log('get-user', serviceToken)
    return this.usersService.decodeUserToken(serviceToken);
  }

  @Post('onVerifyOTP')
  onVerifyOTP(@Body() verifyOTPDTO: VerifyOTPDTO) {
    return this.authService.onVerifyOTP(verifyOTPDTO);
  }
}
