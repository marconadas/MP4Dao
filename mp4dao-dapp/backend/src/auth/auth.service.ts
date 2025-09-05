import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

import { User } from './entities/user.entity';
import { Web3LoginDto } from './dto/web3-login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async web3Login(web3LoginDto: Web3LoginDto) {
    const { walletAddress, signature, message, nonce } = web3LoginDto;

    // Verificar se a mensagem está no formato correto
    const expectedMessage = this.generateLoginMessage(walletAddress, nonce);
    if (message !== expectedMessage) {
      throw new BadRequestException('Invalid message format');
    }

    // Verificar assinatura
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new UnauthorizedException('Invalid signature');
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid signature');
    }

    // Encontrar ou criar usuário
    let user = await this.userRepository.findOne({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    if (!user) {
      user = this.userRepository.create({
        walletAddress: walletAddress.toLowerCase(),
        lastLoginAt: new Date(),
      });
      user = await this.userRepository.save(user);
    } else {
      user.lastLoginAt = new Date();
      await this.userRepository.save(user);
    }

    // Gerar tokens
    const tokens = await this.generateTokens(user);

    // Salvar refresh token
    user.refreshToken = tokens.refreshToken;
    await this.userRepository.save(user);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['works'],
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    Object.assign(user, updateProfileDto);
    user.updatedBy = userId;

    const updatedUser = await this.userRepository.save(user);
    return this.sanitizeUser(updatedUser);
  }

  async logout(userId: string) {
    await this.userRepository.update(userId, {
      refreshToken: null,
    });

    return { message: 'Successfully logged out' };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      walletAddress: user.walletAddress,
      isVerified: user.isVerified,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '7d'),
    };
  }

  private generateLoginMessage(walletAddress: string, nonce: string): string {
    const prefix = this.configService.get('WEB3_MESSAGE_PREFIX', 'Mp4Dao Authentication');
    return `${prefix}\n\nWallet: ${walletAddress}\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`;
  }

  private sanitizeUser(user: User): Partial<User> {
    const { refreshToken, kycDocumentNumber, kycDocumentType, ...sanitized } = user;
    return sanitized;
  }
}
