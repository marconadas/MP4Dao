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

import { useAccount, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, Plus, Network } from 'lucide-react';
import { hardhat } from 'wagmi/chains';
import { useState } from 'react';

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [isAddingNetwork, setIsAddingNetwork] = useState(false);

  const addHardhatNetwork = async () => {
    if (!window.ethereum) {
      alert('MetaMask não está instalada!');
      return;
    }

    setIsAddingNetwork(true);
    
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x7A69', // 31337 em hexadecimal
          chainName: 'Hardhat Local',
          rpcUrls: ['http://127.0.0.1:8545'],
          nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18
          }
        }]
      });
      
      // Switch to Hardhat network after adding
      switchChain({ chainId: hardhat.id });
      
    } catch (error: any) {
      console.error('Erro ao adicionar rede:', error);
      if (error.code === 4902) {
        alert('Erro ao adicionar a rede Hardhat. Tente manualmente.');
      } else if (error.code === -32002) {
        alert('Pedido pendente na MetaMask. Verifique a extensão.');
      }
    } finally {
      setIsAddingNetwork(false);
    }
  };

  const switchToHardhat = () => {
    switchChain({ chainId: hardhat.id });
  };

  if (isConnected && address) {
    const isOnHardhat = chainId === hardhat.id;
    
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">
          {`${address.slice(0, 6)}...${address.slice(-4)}`}
        </span>
        
        {!isOnHardhat && (
          <Button
            variant="outline"
            size="sm"
            onClick={switchToHardhat}
            className="text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            <Network className="h-4 w-4 mr-2" />
            Hardhat
          </Button>
        )}
        
        {isOnHardhat && (
          <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
            Hardhat ✓
          </span>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => disconnect()}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Desconectar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={addHardhatNetwork}
        disabled={isAddingNetwork}
        className="text-blue-600 border-blue-200 hover:bg-blue-50"
      >
        <Plus className="h-4 w-4 mr-2" />
        {isAddingNetwork ? 'A adicionar...' : 'Rede Hardhat'}
      </Button>
      <w3m-button />
    </div>
  );
}
