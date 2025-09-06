/**
 * MP4 DAO - Plataforma de Registo de Copyright Musical em Angola
 * 
 * Copyright (c) 2024 Marcos de Jesus Araújo Cândido dos Santos
 * Rua Luís Simões 55A 2ºEsq, Pendão, Queluz, 2745-035, Lisboa
 * 
 * This file is part of the MP4 DAO project.
 * 
 * Licensed under the MIT License. See LICENSE file for details.
 */
'use client'

import React, { useState, useEffect } from 'react'
import { NFTGallery } from '@/components/nft/nft-gallery'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingBag, 
  TrendingUp, 
  Award, 
  Users,
  Volume2,
  Eye,
  Heart
} from 'lucide-react'

// Mock data para demonstração
const mockNFTs = [
  {
    tokenId: 1,
    contractAddress: '0x1234567890123456789012345678901234567890',
    owner: '0xabcdef1234567890abcdef1234567890abcdef12',
    forSale: true,
    price: '1500000000000000000', // 1.5 ETH em wei
    workId: 'work-1',
    metadata: {
      workType: 'single',
      single: {
        title: 'Luanda Nights',
        artist: 'MC Kuduro',
        genre: 'Kuduro',
        duration: 210,
        releaseDate: '2024-01-15',
        artwork: {
          ipfsCid: 'QmYourHashHere1',
          filename: 'luanda-nights-cover.jpg'
        }
      }
    }
  },
  {
    tokenId: 2,
    contractAddress: '0x1234567890123456789012345678901234567890',
    owner: '0x9876543210987654321098765432109876543210',
    forSale: true,
    price: '5000000000000000000', // 5 ETH em wei
    workId: 'work-2',
    metadata: {
      workType: 'album',
      album: {
        title: 'Sons de Angola',
        artist: 'Banda Maravilha',
        genre: 'Semba',
        releaseDate: '2024-02-20',
        tracks: [
          { title: 'Muxima', duration: 240, trackNumber: 1 },
          { title: 'Benguela', duration: 195, trackNumber: 2 },
          { title: 'Cabinda', duration: 220, trackNumber: 3 }
        ],
        artwork: {
          ipfsCid: 'QmYourHashHere2',
          filename: 'sons-de-angola-cover.jpg'
        }
      }
    }
  },
  {
    tokenId: 3,
    contractAddress: '0x1234567890123456789012345678901234567890',
    owner: '0x5555666677778888999900001111222233334444',
    forSale: false,
    workId: 'work-3',
    metadata: {
      workType: 'ep',
      album: {
        title: 'Ritmos Urbanos EP',
        artist: 'DJ Kaputo',
        genre: 'Afrobeat',
        releaseDate: '2024-03-10',
        tracks: [
          { title: 'Cidade Alta', duration: 180, trackNumber: 1 },
          { title: 'Noite Quente', duration: 200, trackNumber: 2 }
        ],
        artwork: {
          ipfsCid: 'QmYourHashHere3',
          filename: 'ritmos-urbanos-cover.jpg'
        }
      }
    }
  }
]

const marketplaceStats = {
  totalVolume: '1,247.8 ETH',
  totalSales: 3456,
  averagePrice: '2.4 ETH',
  activeListings: 892
}

export default function MarketplacePage() {
  const [nfts, setNfts] = useState(mockNFTs)
  const [isLoading, setIsLoading] = useState(false)
  const [userAddress] = useState('0xabcdef1234567890abcdef1234567890abcdef12') // Mock user address

  const handleRefresh = async () => {
    setIsLoading(true)
    // Simular carregamento
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const featuredNFTs = nfts.filter(nft => nft.forSale).slice(0, 3)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Marketplace de NFTs Musicais
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubra, compre e venda NFTs de música angolana únicos. 
              Apoie artistas locais e possua peças digitais exclusivas.
            </p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{marketplaceStats.totalVolume}</div>
              <div className="text-sm text-gray-600">Volume Total</div>
            </Card>

            <Card className="p-6 text-center">
              <ShoppingBag className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{marketplaceStats.totalSales.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Vendas Totais</div>
            </Card>

            <Card className="p-6 text-center">
              <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{marketplaceStats.averagePrice}</div>
              <div className="text-sm text-gray-600">Preço Médio</div>
            </Card>

            <Card className="p-6 text-center">
              <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{marketplaceStats.activeListings}</div>
              <div className="text-sm text-gray-600">Listagens Ativas</div>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* NFTs em Destaque */}
        {featuredNFTs.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Em Destaque</h2>
              <Badge className="bg-yellow-100 text-yellow-800">
                <Award className="h-3 w-3 mr-1" />
                Seleção da Equipa
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {featuredNFTs.map((nft) => {
                const workData = nft.metadata.album || nft.metadata.single
                const priceEth = parseFloat(nft.price || '0') / 1e18

                return (
                  <Card key={nft.tokenId} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square relative">
                      <img
                        src="/images/default-album-art.jpg"
                        alt={workData?.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-bold text-lg mb-1">
                          {workData?.title}
                        </h3>
                        <p className="text-white/80 text-sm mb-2">
                          {workData?.artist}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge className="bg-white/20 text-white">
                            {nft.metadata.workType.toUpperCase()}
                          </Badge>
                          <div className="text-white font-bold">
                            {priceEth.toFixed(2)} ETH
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>1.2k</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            <span>89</span>
                          </div>
                        </div>
                        <div>#{nft.tokenId}</div>
                      </div>
                      
                      <Button className="w-full">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Comprar Agora
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          </section>
        )}

        {/* Galeria Principal */}
        <NFTGallery
          nfts={nfts}
          isLoading={isLoading}
          userAddress={userAddress}
          onRefresh={handleRefresh}
          title="Todos os NFTs"
          emptyMessage="Nenhum NFT disponível no marketplace"
        />
      </div>
    </div>
  )
}
