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

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Upload, Music, Album, Disc } from 'lucide-react'

interface Track {
  id: string
  title: string
  artist: string
  duration: number
  trackNumber: number
  isrc?: string
  genre?: string
  lyrics?: string
  producer?: string
  composer?: string
}

interface AlbumFormData {
  title: string
  artist: string
  workType: 'album' | 'ep' | 'single' | 'compilation' | 'soundtrack'
  description?: string
  genre?: string
  releaseDate?: string
  recordLabel?: string
  producer?: string
  upc?: string
  catalogNumber?: string
  tracks: Track[]
  credits?: string[]
  copyright?: string
  publishingRights?: string
  artwork?: File
}

const WORK_TYPES = [
  { value: 'single', label: 'Single', icon: Music },
  { value: 'ep', label: 'EP', icon: Disc },
  { value: 'album', label: 'Álbum', icon: Album },
  { value: 'compilation', label: 'Compilação', icon: Album },
  { value: 'soundtrack', label: 'Banda Sonora', icon: Album },
]

export function AlbumRegistrationForm({ onSubmit, isLoading = false }: {
  onSubmit: (data: AlbumFormData) => Promise<void>
  isLoading?: boolean
}) {
  const [formData, setFormData] = useState<AlbumFormData>({
    title: '',
    artist: '',
    workType: 'single',
    tracks: [{
      id: '1',
      title: '',
      artist: '',
      duration: 0,
      trackNumber: 1,
    }],
    credits: [],
  })

  const [newCredit, setNewCredit] = useState('')
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null)

  const addTrack = () => {
    const newTrack: Track = {
      id: Date.now().toString(),
      title: '',
      artist: formData.artist,
      duration: 0,
      trackNumber: formData.tracks.length + 1,
    }
    setFormData(prev => ({
      ...prev,
      tracks: [...prev.tracks, newTrack]
    }))
  }

  const removeTrack = (trackId: string) => {
    setFormData(prev => ({
      ...prev,
      tracks: prev.tracks.filter(t => t.id !== trackId)
    }))
  }

  const updateTrack = (trackId: string, updates: Partial<Track>) => {
    setFormData(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => 
        t.id === trackId ? { ...t, ...updates } : t
      )
    }))
  }

  const addCredit = () => {
    if (newCredit.trim()) {
      setFormData(prev => ({
        ...prev,
        credits: [...(prev.credits || []), newCredit.trim()]
      }))
      setNewCredit('')
    }
  }

  const removeCredit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      credits: prev.credits?.filter((_, i) => i !== index) || []
    }))
  }

  const handleArtworkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, artwork: file }))
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setArtworkPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const parseDuration = (timeStr: string): number => {
    const [mins, secs] = timeStr.split(':').map(Number)
    return (mins || 0) * 60 + (secs || 0)
  }

  const totalDuration = formData.tracks.reduce((total, track) => total + track.duration, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const selectedWorkType = WORK_TYPES.find(type => type.value === formData.workType)

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Informações Básicas */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          {selectedWorkType?.icon && <selectedWorkType.icon className="h-5 w-5" />}
          <h3 className="text-lg font-semibold">Informações Básicas</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="workType">Tipo de Obra</Label>
            <select
              id="workType"
              value={formData.workType}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                workType: e.target.value as AlbumFormData['workType']
              }))}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
            >
              {WORK_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="artist">Artista Principal</Label>
            <Input
              id="artist"
              value={formData.artist}
              onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="genre">Género</Label>
            <Input
              id="genre"
              value={formData.genre || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="releaseDate">Data de Lançamento</Label>
            <Input
              id="releaseDate"
              type="date"
              value={formData.releaseDate || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, releaseDate: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="recordLabel">Editora</Label>
            <Input
              id="recordLabel"
              value={formData.recordLabel || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, recordLabel: e.target.value }))}
            />
          </div>
        </div>

        <div className="mt-6">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
        </div>
      </Card>

      {/* Artwork */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Artwork</h3>
        
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            {artworkPreview ? (
              <img
                src={artworkPreview}
                alt="Artwork preview"
                className="w-32 h-32 object-cover rounded-lg border"
              />
            ) : (
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="artwork">Imagem de Capa</Label>
            <Input
              id="artwork"
              type="file"
              accept="image/*"
              onChange={handleArtworkChange}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Recomendado: 3000x3000px, formato JPG ou PNG
            </p>
          </div>
        </div>
      </Card>

      {/* Faixas */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Faixas</h3>
            <p className="text-sm text-gray-500">
              Total: {formData.tracks.length} faixas • {formatDuration(totalDuration)}
            </p>
          </div>
          <Button type="button" onClick={addTrack} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Faixa
          </Button>
        </div>

        <div className="space-y-4">
          {formData.tracks.map((track, index) => (
            <Card key={track.id} className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Faixa {index + 1}</h4>
                {formData.tracks.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTrack(track.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Título</Label>
                  <Input
                    value={track.title}
                    onChange={(e) => updateTrack(track.id, { title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label>Artista</Label>
                  <Input
                    value={track.artist}
                    onChange={(e) => updateTrack(track.id, { artist: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Duração (mm:ss)</Label>
                  <Input
                    value={track.duration > 0 ? formatDuration(track.duration) : ''}
                    onChange={(e) => updateTrack(track.id, { duration: parseDuration(e.target.value) })}
                    placeholder="3:45"
                  />
                </div>

                <div>
                  <Label>ISRC</Label>
                  <Input
                    value={track.isrc || ''}
                    onChange={(e) => updateTrack(track.id, { isrc: e.target.value })}
                    placeholder="USRC17607839"
                  />
                </div>

                <div>
                  <Label>Produtor</Label>
                  <Input
                    value={track.producer || ''}
                    onChange={(e) => updateTrack(track.id, { producer: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Compositor</Label>
                  <Input
                    value={track.composer || ''}
                    onChange={(e) => updateTrack(track.id, { composer: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label>Letra (opcional)</Label>
                <Textarea
                  value={track.lyrics || ''}
                  onChange={(e) => updateTrack(track.id, { lyrics: e.target.value })}
                  rows={3}
                  placeholder="Letra da música..."
                />
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Créditos */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Créditos</h3>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newCredit}
              onChange={(e) => setNewCredit(e.target.value)}
              placeholder="Ex: Produzido por João Silva"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCredit())}
            />
            <Button type="button" onClick={addCredit} variant="outline">
              Adicionar
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.credits?.map((credit, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {credit}
                <button
                  type="button"
                  onClick={() => removeCredit(index)}
                  className="ml-1 hover:text-red-500"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <Label htmlFor="producer">Produtor Principal</Label>
            <Input
              id="producer"
              value={formData.producer || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, producer: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="upc">UPC/EAN</Label>
            <Input
              id="upc"
              value={formData.upc || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, upc: e.target.value }))}
              placeholder="123456789012"
            />
          </div>

          <div>
            <Label htmlFor="copyright">Copyright</Label>
            <Input
              id="copyright"
              value={formData.copyright || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, copyright: e.target.value }))}
              placeholder="© 2024 Artista"
            />
          </div>

          <div>
            <Label htmlFor="publishingRights">Direitos de Edição</Label>
            <Input
              id="publishingRights"
              value={formData.publishingRights || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, publishingRights: e.target.value }))}
              placeholder="Editora Musical"
            />
          </div>
        </div>
      </Card>

      {/* Botão de Submissão */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} className="min-w-[200px]">
          {isLoading ? 'A registar...' : 'Registar Obra'}
        </Button>
      </div>
    </form>
  )
}
