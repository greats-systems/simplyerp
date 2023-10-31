import {
    Controller,
    Get,
    UseInterceptors,
    ClassSerializerInterceptor, Body, Post, Param, Res,
  } from '@nestjs/common';
import GezaMarketplceService from './geza-marketplaces.service';

   
  @Controller('geza-marketplace')
  @UseInterceptors(ClassSerializerInterceptor)
  export default class GezaMarketplceController {
    constructor(
      private readonly marketplceService: GezaMarketplceService
    ) {}


    @Get('offerItems/:fileId')
    async serveOfferItemImage(@Param('fileId') fileId, @Res() res): Promise<any> {
      res.sendFile(fileId, { root: 'uploadedFiles/offerItems'});
    }
    
    @Get('get-marketplace-beauty-services')
    async getMarketplaceBeautyServices(@Param('fileId') fileId, @Res() res): Promise<any> {
      console.log('Get-marketplace-beauty-services')
      return this.marketplceService.getMarketplaceBeautyServices(fileId);
    }
    @Post('search-for-stylists')
    async searchForOfferItems(@Body() search: string) {
      // return this.marketplceService.searchBeautyServiceProviders(search);
    }
  }