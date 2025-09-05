'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Music, 
  Play, 
  Pause, 
  ShoppingCart, 
  Eye, 
  Heart,
  Share2,
  MoreHorizontal,
  Clock,
  Calendar,
  User,
  Tag
} from 'lucide-react'

interface NFTMetadata {
  workType: string
  album?: {
    title: string
    artist: string
    genre?: string
    releaseDate?: string
    tracks: Array<{
      title: string
      duration?: number
      trackNumber: number
    }>
    artwork?: {
      ipfsCid: string
      filename: string
    }
  }
  single?: {
    title: string
    artist: string
    genre?: string
    duration?: number
    artwork?: {
      ipfsCid: string
      filename: string
    }
  }
}

interface NFTCardProps {
  tokenId: number
  contractAddress: string
  owner: string
  forSale: boolean
  price?: string
  metadata: NFTMetadata
  onBuy?: () => void
  onMakeOffer?: () => void
  onView?: () => void
  isOwner?: boolean
  className?: string
}

export function NFTCard({
  tokenId,
  contractAddress,
  owner,
  forSale,
  price,
  metadata,
  onBuy,
  onMakeOffer,
  onView,
  isOwner = false,
  className = ''
}: NFTCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const getWorkTypeIcon = (workType: string) => {
    switch (workType.toLowerCase()) {
      case 'single':
        return <Music className="h-4 w-4" />
      case 'album':
      case 'ep':
        return <Music className="h-4 w-4" />
      default:
        return <Music className="h-4 w-4" />
    }
  }

  const getWorkTypeColor = (workType: string) => {
    switch (workType.toLowerCase()) {
      case 'single':
        return 'bg-blue-100 text-blue-800'
      case 'album':
        return 'bg-purple-100 text-purple-800'
      case 'ep':
        return 'bg-green-100 text-green-800'
      case 'compilation':
        return 'bg-orange-100 text-orange-800'
      case 'soundtrack':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatPrice = (priceWei: string) => {
    // Converter de wei para ETH
    const priceEth = parseFloat(priceWei) / 1e18
    return `${priceEth.toFixed(4)} ETH`
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return ''
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getArtworkUrl = (artwork?: { ipfsCid: string }) => {
    if (!artwork) return '/images/default-album-art.jpg'
    return `https://ipfs.io/ipfs/${artwork.ipfsCid}`
  }

  const workData = metadata.album || metadata.single
  const artworkUrl = getArtworkUrl(workData?.artwork)

  return (
    <Card className={`overflow-hidden transition-all duration-200 hover:shadow-lg ${className}`}>
      {/* Artwork */}
      <div className="relative aspect-square group">
        <img
          src={artworkUrl}
          alt={workData?.title || 'NFT Artwork'}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/default-album-art.jpg'
          }}
        />
        
        {/* Overlay com controles */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsPlaying(!isPlaying)}
              className="rounded-full w-10 h-10 p-0"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button
              size="sm"
              variant="secondary"
              onClick={onView}
              className="rounded-full w-10 h-10 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Badge do tipo de obra */}
        <div className="absolute top-3 left-3">
          <Badge className={`${getWorkTypeColor(metadata.workType)} flex items-center gap-1`}>
            {getWorkTypeIcon(metadata.workType)}
            {metadata.workType.toUpperCase()}
          </Badge>
        </div>

        {/* Preço se estiver à venda */}
        {forSale && price && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-green-100 text-green-800">
              <Tag className="h-3 w-3 mr-1" />
              {formatPrice(price)}
            </Badge>
          </div>
        )}
      </div>

      {/* Informações */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate" title={workData?.title}>
              {workData?.title}
            </h3>
            <p className="text-gray-600 text-sm truncate" title={workData?.artist}>
              {workData?.artist}
            </p>
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsLiked(!isLiked)}
              className="w-8 h-8 p-0"
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            
            <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
              <Share2 className="h-4 w-4" />
            </Button>
            
            <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          {workData?.genre && (
            <div className="flex items-center gap-2">
              <Music className="h-3 w-3" />
              <span>{workData.genre}</span>
            </div>
          )}
          
          {metadata.album && (
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>{metadata.album.tracks.length} faixas</span>
            </div>
          )}
          
          {metadata.single?.duration && (
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>{formatDuration(metadata.single.duration)}</span>
            </div>
          )}
          
          {'releaseDate' in workData && workData.releaseDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>{new Date(workData.releaseDate).getFullYear()}</span>
            </div>
          )}
        </div>

        {/* Informações do NFT */}
        <div className="border-t pt-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Token ID</span>
            <span>#{tokenId}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Proprietário</span>
            <span className="truncate max-w-[100px]" title={owner}>
              {isOwner ? 'Você' : `${owner.slice(0, 6)}...${owner.slice(-4)}`}
            </span>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="mt-4 flex gap-2">
          {forSale && !isOwner && (
            <>
              <Button onClick={onBuy} className="flex-1" size="sm">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Comprar
              </Button>
              <Button onClick={onMakeOffer} variant="outline" className="flex-1" size="sm">
                Oferecer
              </Button>
            </>
          )}
          
          {!forSale && !isOwner && (
            <Button onClick={onMakeOffer} variant="outline" className="w-full" size="sm">
              Fazer Oferta
            </Button>
          )}
          
          {isOwner && (
            <Button variant="outline" className="w-full" size="sm">
              {forSale ? 'Remover da Venda' : 'Colocar à Venda'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
