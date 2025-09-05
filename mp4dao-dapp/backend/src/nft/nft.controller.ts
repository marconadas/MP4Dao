import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NFTService } from './nft.service';
import { WorkMetadataDto } from '../works/dto/album-metadata.dto';

@Controller('nft')
export class NFTController {
  constructor(private readonly nftService: NFTService) {}

  @Post(':workId/mint')
  async mintNFT(
    @Param('workId') workId: string,
    @Body() metadata: WorkMetadataDto,
  ) {
    return this.nftService.mintNFTForWork(workId, metadata);
  }

  @Get(':workId/info')
  async getNFTInfo(@Param('workId') workId: string) {
    return this.nftService.getNFTInfo(workId);
  }

  @Post(':workId/list-for-sale')
  async listForSale(
    @Param('workId') workId: string,
    @Body() body: { price: string; userAddress: string },
  ) {
    return this.nftService.listNFTForSale(workId, body.price, body.userAddress);
  }

  @Post(':workId/buy')
  async buyNFT(
    @Param('workId') workId: string,
    @Body() body: { buyerAddress: string; value: string },
  ) {
    return this.nftService.buyNFT(workId, body.buyerAddress, body.value);
  }

  @Post(':workId/make-offer')
  async makeOffer(
    @Param('workId') workId: string,
    @Body() body: { 
      buyerAddress: string; 
      offerValue: string; 
      expirationTime: number 
    },
  ) {
    return this.nftService.makeOffer(
      workId,
      body.buyerAddress,
      body.offerValue,
      body.expirationTime,
    );
  }

  @Post(':workId/accept-offer')
  async acceptOffer(
    @Param('workId') workId: string,
    @Body() body: { ownerAddress: string; buyerAddress: string },
  ) {
    return this.nftService.acceptOffer(workId, body.ownerAddress, body.buyerAddress);
  }

  @Get('user/:userAddress')
  async getUserNFTs(@Param('userAddress') userAddress: string) {
    return this.nftService.getUserNFTs(userAddress);
  }
}
