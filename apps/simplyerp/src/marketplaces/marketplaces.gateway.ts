import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { MarketplacesService } from './marketplaces.service';
import { CreateMarketplaceDto } from './dto/create-marketplace.dto';
import { UpdateMarketplaceDto } from './dto/update-marketplace.dto';

@WebSocketGateway()
export class MarketplacesGateway {
  constructor(private readonly marketplacesService: MarketplacesService) {}

  @SubscribeMessage('createMarketplace')
  create(@MessageBody() createMarketplaceDto: CreateMarketplaceDto) {
    return this.marketplacesService.create(createMarketplaceDto);
  }

  @SubscribeMessage('findAllMarketplaces')
  findAll() {
    return this.marketplacesService.findAll();
  }

  @SubscribeMessage('findOneMarketplace')
  findOne(@MessageBody() id: number) {
    return this.marketplacesService.findOne(id);
  }

  @SubscribeMessage('updateMarketplace')
  update(@MessageBody() updateMarketplaceDto: UpdateMarketplaceDto) {
    return this.marketplacesService.update(updateMarketplaceDto.id, updateMarketplaceDto);
  }

  @SubscribeMessage('removeMarketplace')
  remove(@MessageBody() id: number) {
    return this.marketplacesService.remove(id);
  }
}
