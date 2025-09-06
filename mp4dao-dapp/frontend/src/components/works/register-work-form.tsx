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
'use client';

import React, { useState, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, keccak256, toBytes } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Upload, X, Plus, Minus, Loader2, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WORK_REGISTRY_ABI, WORK_REGISTRY_ADDRESS } from '@/lib/web3/config';

interface Author {
  address: string;
  percentage: number;
}

interface WorkFile {
  file: File;
  hash: string;
  type: 'audio' | 'lyrics' | 'sheet_music' | 'other';
}

const WORK_TYPES = {
  0: 'Música Completa',
  1: 'Apenas Letra',
  2: 'Instrumental',
  3: 'Remix',
  4: 'Cover',
  5: 'Sample/Loop'
};

export function RegisterWorkForm() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    creationDate: '',
    iswc: '',
    isrc: '',
    workType: '0',
    publicListing: false,
  });

  const [authors, setAuthors] = useState<Author[]>([
    { address: address || '', percentage: 100 }
  ]);

  const [files, setFiles] = useState<WorkFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isDragOver, setIsDragOver] = useState(false);

  // Update main author when wallet changes
  React.useEffect(() => {
    if (address && authors.length > 0) {
      setAuthors(prev => prev.map((author, index) => 
        index === 0 ? { ...author, address } : author
      ));
    }
  }, [address]);

  // File upload handler
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const newFiles: WorkFile[] = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
        
        // Generate file hash
        const buffer = await file.arrayBuffer();
        const hashBytes = keccak256(new Uint8Array(buffer));
        const hash = `0x${hashBytes.slice(2)}`; // Remove '0x' and add it back properly
        
        // Determine file type
        let type: WorkFile['type'] = 'other';
        if (file.type.startsWith('audio/')) type = 'audio';
        else if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.lrc')) type = 'lyrics';
        else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) type = 'sheet_music';
        
        newFiles.push({ file, hash, type });
      }
      
      setFiles(prev => [...prev, ...newFiles]);
      
      // Clear the input so the same file can be selected again if needed
      event.target.value = '';
      
    } catch (error) {
      console.error('Erro ao processar ficheiros:', error);
      alert('Erro ao processar ficheiros. Tente novamente.');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, []);

  // Drag & Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    // Process dropped files the same way as uploaded files
    const fakeEvent = {
      target: { files: droppedFiles, value: '' }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    
    await handleFileUpload(fakeEvent);
  }, [handleFileUpload]);

  // Add/remove authors
  const addAuthor = () => {
    if (authors.length < 10) {
      setAuthors(prev => [...prev, { address: '', percentage: 0 }]);
    }
  };

  const removeAuthor = (index: number) => {
    if (authors.length > 1) {
      setAuthors(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateAuthor = (index: number, field: keyof Author, value: string | number) => {
    setAuthors(prev => prev.map((author, i) => 
      i === index ? { ...author, [field]: value } : author
    ));
  };

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Título é obrigatório';
    }

    if (files.length === 0) {
      errors.files = 'Pelo menos um ficheiro é obrigatório';
    }

    // Validate authors
    const totalPercentage = authors.reduce((sum, author) => sum + author.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      errors.authors = 'A soma das percentagens deve ser exatamente 100%';
    }

    for (const author of authors) {
      if (!author.address.trim()) {
        errors.authors = 'Todos os autores devem ter um endereço válido';
        break;
      }
      if (author.percentage <= 0) {
        errors.authors = 'Todas as percentagens devem ser maiores que 0%';
        break;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      alert('Por favor, conecte a sua carteira primeiro');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      // Create work hash from all files
      const allFilesBuffer = new Uint8Array(
        files.reduce((acc, file) => acc + file.file.size, 0)
      );
      
      let offset = 0;
      for (const workFile of files) {
        const buffer = await workFile.file.arrayBuffer();
        allFilesBuffer.set(new Uint8Array(buffer), offset);
        offset += buffer.byteLength;
      }
      
      const workHash = keccak256(allFilesBuffer);

      // Create metadata object
      const metadata = {
        title: formData.title,
        description: formData.description,
        genre: formData.genre,
        creationDate: formData.creationDate,
        iswc: formData.iswc,
        isrc: formData.isrc,
        files: files.map(f => ({
          name: f.file.name,
          type: f.type,
          hash: f.hash,
          size: f.file.size
        }))
      };

      // For now, we'll use a placeholder IPFS URI
      // In production, you would upload to IPFS/Arweave here
      const metadataURI = `ipfs://placeholder-${Date.now()}`;

      // Prepare contract call
      const authorsAddresses = authors.map(a => a.address as `0x${string}`);
      const splitsBps = authors.map(a => Math.round(a.percentage * 100)); // Convert to basis points

      writeContract({
        address: WORK_REGISTRY_ADDRESS,
        abi: WORK_REGISTRY_ABI,
        functionName: 'registerWork',
        args: [
          workHash,
          metadataURI,
          authorsAddresses,
          splitsBps,
          parseInt(formData.workType),
          formData.publicListing
        ],
        account: address,
        chain: undefined,
        value: parseEther('0.001') // Registration fee
      });

    } catch (error) {
      console.error('Erro ao registar obra:', error);
    }
  };

  if (isSuccess) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Obra Registada com Sucesso!
            </h2>
            <p className="text-muted-foreground mb-4">
              A sua obra foi registada na blockchain. O registo é permanente e imutável.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Hash da Transação: <code className="bg-muted px-2 py-1 rounded">{hash}</code>
            </p>
            <Button onClick={() => window.location.reload()}>
              Registar Outra Obra
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Work Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Obra</CardTitle>
          <CardDescription>
            Dados básicos sobre a sua obra musical
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Nome da obra"
                required
              />
              {formErrors.title && (
                <p className="text-sm text-destructive">{formErrors.title}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="genre">Género</Label>
              <Input
                id="genre"
                value={formData.genre}
                onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                placeholder="Ex: Hip-Hop, Kizomba, etc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição detalhada da obra..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workType">Tipo de Obra</Label>
              <Select value={formData.workType} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, workType: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(WORK_TYPES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="creationDate">Data de Criação</Label>
              <Input
                id="creationDate"
                type="date"
                value={formData.creationDate}
                onChange={(e) => setFormData(prev => ({ ...prev, creationDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="iswc">ISWC</Label>
              <Input
                id="iswc"
                value={formData.iswc}
                onChange={(e) => setFormData(prev => ({ ...prev, iswc: e.target.value }))}
                placeholder="T-123456789-0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authors and Rights */}
      <Card>
        <CardHeader>
          <CardTitle>Autores e Direitos</CardTitle>
          <CardDescription>
            Defina os autores e as respetivas percentagens de direitos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {authors.map((author, index) => (
            <div key={index} className="flex items-end gap-4 p-4 border rounded-lg">
              <div className="flex-1 space-y-2">
                <Label>Endereço da Carteira</Label>
                <Input
                  value={author.address}
                  onChange={(e) => updateAuthor(index, 'address', e.target.value)}
                  placeholder="0x..."
                  disabled={index === 0} // Main author (connected wallet)
                />
              </div>
              <div className="w-24 space-y-2">
                <Label>Percentagem</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={author.percentage}
                  onChange={(e) => updateAuthor(index, 'percentage', parseFloat(e.target.value) || 0)}
                />
              </div>
              {authors.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeAuthor(index)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          {authors.length < 10 && (
            <Button
              type="button"
              variant="outline"
              onClick={addAuthor}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Autor
            </Button>
          )}
          
          {formErrors.authors && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formErrors.authors}</AlertDescription>
            </Alert>
          )}
          
          <div className="text-sm text-muted-foreground">
            Total: {authors.reduce((sum, author) => sum + author.percentage, 0).toFixed(2)}%
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Ficheiros da Obra</CardTitle>
          <CardDescription>
            Carregue os ficheiros que comprovam a autoria da obra
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div 
            className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
              isDragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="space-y-2">
                <Label htmlFor="file-upload" className="cursor-pointer block">
                  <Button type="button" variant="outline" className="mb-2">
                    <Upload className="h-4 w-4 mr-2" />
                    Escolher Ficheiros
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    ou arraste e solte ficheiros aqui
                  </p>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Formatos suportados: MP3, WAV, FLAC, TXT, PDF, DOC, DOCX
                </p>
                {isDragOver && (
                  <p className="text-sm text-primary font-medium">
                    Solte os ficheiros para carregar
                  </p>
                )}
              </div>
              <Input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept="audio/*,text/*,.pdf,.doc,.docx,.txt,.lrc"
              />
            </div>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>A processar ficheiros...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Ficheiros Carregados:</h4>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{file.file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {file.type} • {(file.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {formErrors.files && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formErrors.files}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
          <CardDescription>
            Opções de privacidade e visibilidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="publicListing"
              checked={formData.publicListing}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, publicListing: checked as boolean }))
              }
            />
            <Label htmlFor="publicListing">
              Listagem pública (a obra será visível no catálogo público)
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Taxa de Registo:</strong> 0.001 ETH (~$2.50)<br />
                O registo é permanente e não pode ser alterado após confirmação.
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Erro: {error.message}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={!isConnected || isPending || isConfirming}
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isPending ? 'A confirmar...' : 'A processar...'}
                </>
              ) : (
                'Registar Obra (0.001 ETH)'
              )}
            </Button>

            {!isConnected && (
              <p className="text-center text-sm text-muted-foreground">
                Conecte a sua carteira para registar a obra
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
