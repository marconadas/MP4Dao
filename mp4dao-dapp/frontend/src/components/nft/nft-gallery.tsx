'use client'

import React, { useState, useEffect } from 'react'
import { NFTCard } from './nft-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  SortAsc, 
  SortDesc,
  Music,
  Album,
  Disc,
  RefreshCw
} from 'lucide-react'

interface NFTData {
  tokenId: number
  contractAddress: string
  owner: string
  forSale: boolean
  price?: string
  metadata: any
  workId: string
}

interface NFTGalleryProps {
  nfts: NFTData[]
  isLoading?: boolean
  userAddress?: string
  onRefresh?: () => void
  showFilters?: boolean
  title?: string
  emptyMessage?: string
}

const WORK_TYPE_FILTERS = [
  { value: 'all', label: 'Todos os Tipos', icon: Music },
  { value: 'single', label: 'Singles', icon: Music },
  { value: 'ep', label: 'EPs', icon: Disc },
  { value: 'album', label: 'Álbuns', icon: Album },
  { value: 'compilation', label: 'Compilações', icon: Album },
  { value: 'soundtrack', label: 'Bandas Sonoras', icon: Album },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mais Recentes' },
  { value: 'oldest', label: 'Mais Antigos' },
  { value: 'price-low', label: 'Menor Preço' },
  { value: 'price-high', label: 'Maior Preço' },
  { value: 'name-asc', label: 'Nome A-Z' },
  { value: 'name-desc', label: 'Nome Z-A' },
]

export function NFTGallery({
  nfts,
  isLoading = false,
  userAddress,
  onRefresh,
  showFilters = true,
  title = 'Galeria de NFTs Musicais',
  emptyMessage = 'Nenhum NFT encontrado'
}: NFTGalleryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWorkType, setSelectedWorkType] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showOnlyForSale, setShowOnlyForSale] = useState(false)
  const [filteredNFTs, setFilteredNFTs] = useState<NFTData[]>(nfts)

  // Filtrar e ordenar NFTs
  useEffect(() => {
    let filtered = [...nfts]

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(nft => {
        const workData = nft.metadata.album || nft.metadata.single
        const title = workData?.title?.toLowerCase() || ''
        const artist = workData?.artist?.toLowerCase() || ''
        const search = searchTerm.toLowerCase()
        
        return title.includes(search) || artist.includes(search)
      })
    }

    // Filtro por tipo de obra
    if (selectedWorkType !== 'all') {
      filtered = filtered.filter(nft => 
        nft.metadata.workType.toLowerCase() === selectedWorkType
      )
    }

    // Filtro por itens à venda
    if (showOnlyForSale) {
      filtered = filtered.filter(nft => nft.forSale)
    }

    // Ordenação
    filtered.sort((a, b) => {
      const aData = a.metadata.album || a.metadata.single
      const bData = b.metadata.album || b.metadata.single

      switch (sortBy) {
        case 'newest':
          return b.tokenId - a.tokenId
        case 'oldest':
          return a.tokenId - b.tokenId
        case 'price-low':
          if (!a.forSale && !b.forSale) return 0
          if (!a.forSale) return 1
          if (!b.forSale) return -1
          return parseFloat(a.price || '0') - parseFloat(b.price || '0')
        case 'price-high':
          if (!a.forSale && !b.forSale) return 0
          if (!a.forSale) return 1
          if (!b.forSale) return -1
          return parseFloat(b.price || '0') - parseFloat(a.price || '0')
        case 'name-asc':
          return (aData?.title || '').localeCompare(bData?.title || '')
        case 'name-desc':
          return (bData?.title || '').localeCompare(aData?.title || '')
        default:
          return 0
      }
    })

    setFilteredNFTs(filtered)
  }, [nfts, searchTerm, selectedWorkType, sortBy, showOnlyForSale])

  const handleBuyNFT = (tokenId: number) => {
    console.log('Comprar NFT:', tokenId)
    // Implementar lógica de compra
  }

  const handleMakeOffer = (tokenId: number) => {
    console.log('Fazer oferta para NFT:', tokenId)
    // Implementar lógica de oferta
  }

  const handleViewNFT = (tokenId: number) => {
    console.log('Ver detalhes do NFT:', tokenId)
    // Implementar navegação para página de detalhes
  }

  const getWorkTypeCount = (workType: string) => {
    if (workType === 'all') return nfts.length
    return nfts.filter(nft => nft.metadata.workType.toLowerCase() === workType).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-gray-600 mt-1">
            {filteredNFTs.length} de {nfts.length} NFTs
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
          
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por título ou artista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Filtro por tipo */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tipo de Obra
              </label>
              <select
                value={selectedWorkType}
                onChange={(e) => setSelectedWorkType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {WORK_TYPE_FILTERS.map(filter => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label} ({getWorkTypeCount(filter.value)})
                  </option>
                ))}
              </select>
            </div>

            {/* Ordenação */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggle para itens à venda */}
            <div className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                id="forSaleOnly"
                checked={showOnlyForSale}
                onChange={(e) => setShowOnlyForSale(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="forSaleOnly" className="text-sm font-medium text-gray-700">
                Apenas à venda
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Grid/Lista de NFTs */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Carregando NFTs...</span>
        </div>
      ) : filteredNFTs.length > 0 ? (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {filteredNFTs.map((nft) => (
            <NFTCard
              key={`${nft.contractAddress}-${nft.tokenId}`}
              tokenId={nft.tokenId}
              contractAddress={nft.contractAddress}
              owner={nft.owner}
              forSale={nft.forSale}
              price={nft.price}
              metadata={nft.metadata}
              onBuy={() => handleBuyNFT(nft.tokenId)}
              onMakeOffer={() => handleMakeOffer(nft.tokenId)}
              onView={() => handleViewNFT(nft.tokenId)}
              isOwner={userAddress?.toLowerCase() === nft.owner.toLowerCase()}
              className={viewMode === 'list' ? 'flex-row' : ''}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Music className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyMessage}</h3>
          <p className="text-gray-500">
            {searchTerm || selectedWorkType !== 'all' || showOnlyForSale
              ? 'Tente ajustar os filtros para ver mais resultados.'
              : 'Seja o primeiro a criar um NFT musical!'}
          </p>
        </div>
      )}
    </div>
  )
}
