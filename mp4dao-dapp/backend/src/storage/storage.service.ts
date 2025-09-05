import { Injectable, Logger } from '@nestjs/common';
import { create } from 'ipfs-http-client';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private ipfs: any;

  constructor() {
    this.initializeIPFS();
  }

  private async initializeIPFS() {
    try {
      // Initialize IPFS client (use environment variables in production)
      const ipfsUrl = process.env.IPFS_URL || 'http://localhost:5001';
      this.ipfs = create({ url: ipfsUrl });
      
      this.logger.log('IPFS client initialized');
    } catch (error) {
      this.logger.warn('IPFS not available, using local storage fallback');
      this.ipfs = null;
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      if (this.ipfs) {
        return await this.uploadToIPFS(file);
      } else {
        return await this.saveToLocalStorage(file);
      }
    } catch (error) {
      this.logger.error(`Failed to upload file ${file.originalname}: ${error.message}`);
      throw error;
    }
  }

  private async uploadToIPFS(file: Express.Multer.File): Promise<string> {
    try {
      const result = await this.ipfs.add(file.buffer, {
        pin: true,
        wrapWithDirectory: false,
      });

      const cid = result.cid.toString();
      this.logger.log(`File ${file.originalname} uploaded to IPFS: ${cid}`);
      
      return cid;
    } catch (error) {
      this.logger.error(`IPFS upload failed: ${error.message}`);
      // Fallback to local storage
      return await this.saveToLocalStorage(file);
    }
  }

  private async saveToLocalStorage(file: Express.Multer.File): Promise<string> {
    try {
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(uploadDir, fileName);

      // Ensure upload directory exists
      await fs.mkdir(uploadDir, { recursive: true });

      // Save file
      await fs.writeFile(filePath, file.buffer);

      this.logger.log(`File ${file.originalname} saved locally: ${fileName}`);
      
      return fileName; // Return filename as "CID" for local storage
    } catch (error) {
      this.logger.error(`Local storage save failed: ${error.message}`);
      throw error;
    }
  }

  async getFile(cid: string): Promise<Buffer> {
    try {
      if (this.ipfs && cid.startsWith('Qm')) {
        return await this.getFromIPFS(cid);
      } else {
        return await this.getFromLocalStorage(cid);
      }
    } catch (error) {
      this.logger.error(`Failed to get file ${cid}: ${error.message}`);
      throw error;
    }
  }

  private async getFromIPFS(cid: string): Promise<Buffer> {
    try {
      const chunks = [];
      for await (const chunk of this.ipfs.cat(cid)) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } catch (error) {
      this.logger.error(`IPFS retrieval failed: ${error.message}`);
      throw error;
    }
  }

  private async getFromLocalStorage(fileName: string): Promise<Buffer> {
    try {
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const filePath = path.join(uploadDir, fileName);
      
      return await fs.readFile(filePath);
    } catch (error) {
      this.logger.error(`Local storage retrieval failed: ${error.message}`);
      throw error;
    }
  }

  async uploadMetadata(metadata: any): Promise<string> {
    try {
      const metadataBuffer = Buffer.from(JSON.stringify(metadata, null, 2));
      const file = {
        buffer: metadataBuffer,
        originalname: 'metadata.json',
        mimetype: 'application/json',
        size: metadataBuffer.length,
      } as Express.Multer.File;

      return await this.uploadFile(file);
    } catch (error) {
      this.logger.error(`Failed to upload metadata: ${error.message}`);
      throw error;
    }
  }

  async getMetadata(cid: string): Promise<any> {
    try {
      const buffer = await this.getFile(cid);
      return JSON.parse(buffer.toString());
    } catch (error) {
      this.logger.error(`Failed to get metadata ${cid}: ${error.message}`);
      throw error;
    }
  }

  async deleteFile(cid: string): Promise<boolean> {
    try {
      if (this.ipfs && cid.startsWith('Qm')) {
        // IPFS files are immutable, so we can't delete them
        // We would need to implement a pinning service to unpin
        this.logger.warn(`Cannot delete IPFS file: ${cid}`);
        return false;
      } else {
        return await this.deleteFromLocalStorage(cid);
      }
    } catch (error) {
      this.logger.error(`Failed to delete file ${cid}: ${error.message}`);
      return false;
    }
  }

  private async deleteFromLocalStorage(fileName: string): Promise<boolean> {
    try {
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const filePath = path.join(uploadDir, fileName);
      
      await fs.unlink(filePath);
      this.logger.log(`File deleted from local storage: ${fileName}`);
      
      return true;
    } catch (error) {
      this.logger.error(`Local storage deletion failed: ${error.message}`);
      return false;
    }
  }

  getFileUrl(cid: string): string {
    if (this.ipfs && cid.startsWith('Qm')) {
      const ipfsGateway = process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs';
      return `${ipfsGateway}/${cid}`;
    } else {
      const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
      return `${baseUrl}/api/storage/files/${cid}`;
    }
  }

  /**
   * Upload artwork with metadata
   */
  async uploadArtwork(file: Express.Multer.File): Promise<{
    ipfsCid: string;
    sha256: string;
    filename: string;
    size: number;
    mimeType: string;
    width?: number;
    height?: number;
  }> {
    try {
      // Calcular hash SHA-256
      const hash = crypto.createHash('sha256');
      hash.update(file.buffer);
      const sha256 = hash.digest('hex');

      // Upload para IPFS ou storage local
      const ipfsCid = await this.uploadFile(file);

      // Se for imagem, tentar obter dimensões
      let width: number | undefined;
      let height: number | undefined;

      if (file.mimetype.startsWith('image/')) {
        try {
          // Tentar usar sharp se disponível
          const sharp = require('sharp');
          const metadata = await sharp(file.buffer).metadata();
          width = metadata.width;
          height = metadata.height;
        } catch (error) {
          this.logger.warn('Could not extract image dimensions (sharp not available):', error.message);
          
          // Fallback básico para obter dimensões (seria implementado conforme necessário)
          try {
            // Implementar extração básica de dimensões se necessário
          } catch (fallbackError) {
            this.logger.warn('Fallback dimension extraction also failed');
          }
        }
      }

      const artworkData = {
        ipfsCid,
        sha256,
        filename: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        width,
        height,
      };

      this.logger.log(`Artwork uploaded: ${file.originalname} -> ${ipfsCid}`);
      return artworkData;
    } catch (error) {
      this.logger.error('Error uploading artwork:', error);
      throw new Error('Failed to upload artwork');
    }
  }

  /**
   * Upload JSON metadata
   */
  async uploadJSON(data: any): Promise<string> {
    try {
      const metadataBuffer = Buffer.from(JSON.stringify(data, null, 2));
      const file = {
        buffer: metadataBuffer,
        originalname: `metadata-${Date.now()}.json`,
        mimetype: 'application/json',
        size: metadataBuffer.length,
      } as Express.Multer.File;

      return await this.uploadFile(file);
    } catch (error) {
      this.logger.error('Failed to upload JSON metadata:', error);
      throw error;
    }
  }

  /**
   * Get JSON metadata
   */
  async getJSON(cid: string): Promise<any> {
    try {
      const buffer = await this.getFile(cid);
      return JSON.parse(buffer.toString());
    } catch (error) {
      this.logger.error(`Failed to get JSON metadata ${cid}:`, error);
      throw error;
    }
  }
}
