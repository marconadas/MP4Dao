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
  Wallet, 
  Plus, 
  TrendingUp, 
  Eye,
  ShoppingBag,
  Music
} from 'lucide-react'
import Link from 'next/link'

// Mock data - em produção viria da API
const mockUserNFTs = [
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
    tokenId: 4,
    contractAddress: '0x1234567890123456789012345678901234567890',
    owner: '0xabcdef1234567890abcdef1234567890abcdef12',
    forSale: false,
    workId: 'work-4',
    metadata: {
      workType: 'album',
      album: {
        title: 'Minha Coleção',
        artist: 'Artista Local',
        genre: 'Kizomba',
        releaseDate: '2024-01-20',
        tracks: [
          { title: 'Amor Eterno', duration: 240, trackNumber: 1 },
          { title: 'Saudade', duration: 195, trackNumber: 2 }
        ],
        artwork: {
          ipfsCid: 'QmYourHashHere4',
          filename: 'minha-colecao-cover.jpg'
        }
      }
    }
  }
]

const userStats = {
  totalNFTs: 2,
  totalValue: '3.2 ETH',
  forSale: 1,
  totalViews: 1847
}

export default function MyNFTsPage() {
  const [nfts, setNfts] = useState(mockUserNFTs)
  const [isLoading, setIsLoading] = useState(false)
  const [userAddress] = useState('0xabcdef1234567890abcdef1234567890abcdef12')

  const handleRefresh = async () => {
    setIsLoading(true)
    // Simular carregamento da API
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const nftsForSale = nfts.filter(nft => nft.forSale)
  const nftsNotForSale = nfts.filter(nft => !nft.forSale)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Os Meus NFTs
              </h1>
              <p className="text-gray-600">
                Gere a sua coleção de NFTs musicais
              </p>
            </div>
            
            <div className="flex gap-3">
              <Link href="/works/register">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar NFT
                </Button>
              </Link>
              
              <Link href="/marketplace">
                <Button variant="outline">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Marketplace
                </Button>
              </Link>
            </div>
          </div>

          {/* Estatísticas do Usuário */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="p-6 text-center">
              <Wallet className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{userStats.totalNFTs}</div>
              <div className="text-sm text-gray-600">NFTs Possuídos</div>
            </Card>

            <Card className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{userStats.totalValue}</div>
              <div className="text-sm text-gray-600">Valor Estimado</div>
            </Card>

            <Card className="p-6 text-center">
              <ShoppingBag className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{userStats.forSale}</div>
              <div className="text-sm text-gray-600">À Venda</div>
            </Card>

            <Card className="p-6 text-center">
              <Eye className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{userStats.totalViews.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Visualizações</div>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {nfts.length === 0 ? (
          // Estado vazio
          <Card className="p-12 text-center">
            <Music className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Ainda não tem NFTs
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Comece a sua jornada no mundo dos NFTs musicais. 
              Registe uma obra e crie o seu primeiro NFT.
            </p>
            <Link href="/works/register">
              <Button size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Criar Primeiro NFT
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-12">
            {/* NFTs à venda */}
            {nftsForSale.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">À Venda</h2>
                  <Badge className="bg-green-100 text-green-800">
                    {nftsForSale.length} {nftsForSale.length === 1 ? 'item' : 'itens'}
                  </Badge>
                </div>
                
                <NFTGallery
                  nfts={nftsForSale}
                  isLoading={isLoading}
                  userAddress={userAddress}
                  onRefresh={handleRefresh}
                  showFilters={false}
                  title=""
                />
              </section>
            )}

            {/* NFTs não à venda */}
            {nftsNotForSale.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Coleção Pessoal</h2>
                  <Badge className="bg-blue-100 text-blue-800">
                    {nftsNotForSale.length} {nftsNotForSale.length === 1 ? 'item' : 'itens'}
                  </Badge>
                </div>
                
                <NFTGallery
                  nfts={nftsNotForSale}
                  isLoading={isLoading}
                  userAddress={userAddress}
                  onRefresh={handleRefresh}
                  showFilters={false}
                  title=""
                />
              </section>
            )}

            {/* Todos os NFTs com filtros */}
            <section>
              <NFTGallery
                nfts={nfts}
                isLoading={isLoading}
                userAddress={userAddress}
                onRefresh={handleRefresh}
                title="Todos os Meus NFTs"
                emptyMessage="Nenhum NFT encontrado"
              />
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
