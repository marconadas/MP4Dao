'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Coins, 
  Vote, 
  Shield, 
  TrendingUp, 
  Users, 
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface TokenInfo {
  name: string
  symbol: string
  totalSupply: string
  contractAddress: string
}

interface UserTokenData {
  balance: string
  canMediate: boolean
  stake: {
    amount: string
    active: boolean
    rewardsEarned: string
  }
}

interface ProposalData {
  id: number
  description: string
  status: string
  forVotes: string
  againstVotes: string
  endTime: number
}

export default function TokenDashboard() {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [userTokenData, setUserTokenData] = useState<UserTokenData | null>(null)
  const [proposals, setProposals] = useState<ProposalData[]>([])
  const [loading, setLoading] = useState(true)
  const [userAddress, setUserAddress] = useState<string>('')

  useEffect(() => {
    // Simular dados para demonstração
    // Em produção, estes dados viriam da API
    setTokenInfo({
      name: 'MP4DAO Token',
      symbol: 'MP4',
      totalSupply: '20000000',
      contractAddress: '0x...'
    })

    setUserTokenData({
      balance: '1250.50',
      canMediate: false,
      stake: {
        amount: '5000',
        active: false,
        rewardsEarned: '125.75'
      }
    })

    setProposals([
      {
        id: 1,
        description: 'Reduzir taxa de registo para 0.0005 ETH',
        status: 'active',
        forVotes: '15000',
        againstVotes: '3000',
        endTime: Date.now() + 86400000 * 3 // 3 dias
      },
      {
        id: 2,
        description: 'Adicionar suporte para NFTs de vídeo',
        status: 'ended',
        forVotes: '25000',
        againstVotes: '8000',
        endTime: Date.now() - 86400000 // 1 dia atrás
      }
    ])

    setLoading(false)
  }, [])

  const formatNumber = (num: string) => {
    return parseFloat(num).toLocaleString('pt-PT', { maximumFractionDigits: 2 })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'ended': return 'bg-gray-500'
      case 'executed': return 'bg-blue-500'
      default: return 'bg-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa'
      case 'ended': return 'Encerrada'
      case 'executed': return 'Executada'
      default: return 'Pendente'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          MP4DAO Token Dashboard
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Gerencie seus tokens MP4, participe na governança e ganhe recompensas
        </p>
      </div>

      {/* Token Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seu Balance</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userTokenData ? formatNumber(userTokenData.balance) : '0'} MP4
            </div>
            <p className="text-xs text-muted-foreground">
              ≈ $125.50 USD
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Supply</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tokenInfo ? formatNumber(tokenInfo.totalSupply) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              de 100M MP4 máximo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Staking</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userTokenData ? formatNumber(userTokenData.stake.amount) : '0'} MP4
            </div>
            <p className="text-xs text-muted-foreground">
              {userTokenData?.canMediate ? 'Mediador Ativo' : 'Não Mediador'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recompensas</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userTokenData ? formatNumber(userTokenData.stake.rewardsEarned) : '0'} MP4
            </div>
            <p className="text-xs text-muted-foreground">
              Ganhas este mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="governance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="governance">Governança</TabsTrigger>
          <TabsTrigger value="staking">Staking</TabsTrigger>
          <TabsTrigger value="rewards">Recompensas</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
        </TabsList>

        {/* Governance Tab */}
        <TabsContent value="governance" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Propostas de Governança</h2>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Vote className="mr-2 h-4 w-4" />
              Criar Proposta
            </Button>
          </div>

          <div className="grid gap-4">
            {proposals.map((proposal) => (
              <Card key={proposal.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        Proposta #{proposal.id}
                      </CardTitle>
                      <CardDescription>
                        {proposal.description}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(proposal.status)}>
                      {getStatusText(proposal.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Voting Results */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center">
                          <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                          A Favor: {formatNumber(proposal.forVotes)} MP4
                        </span>
                        <span className="flex items-center">
                          <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                          Contra: {formatNumber(proposal.againstVotes)} MP4
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{
                            width: `${(parseFloat(proposal.forVotes) / (parseFloat(proposal.forVotes) + parseFloat(proposal.againstVotes))) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      {proposal.status === 'active' && (
                        <>
                          <Button variant="outline" size="sm" className="text-green-600">
                            Votar A Favor
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600">
                            Votar Contra
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm">
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Staking Tab */}
        <TabsContent value="staking" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Staking de Mediador</CardTitle>
                <CardDescription>
                  Faça stake de 10.000 MP4 para se tornar mediador
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold">
                    {userTokenData ? formatNumber(userTokenData.stake.amount) : '0'} MP4
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Mínimo necessário: 10.000 MP4
                  </p>
                </div>

                <div className="space-y-2">
                  <Button className="w-full" disabled={!userTokenData || parseFloat(userTokenData.balance) < 10000}>
                    {userTokenData?.canMediate ? 'Aumentar Stake' : 'Tornar-se Mediador'}
                  </Button>
                  {userTokenData?.stake.active && (
                    <Button variant="outline" className="w-full">
                      Retirar Stake
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Benefícios do Staking</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center">
                    <Shield className="mr-2 h-4 w-4 text-green-500" />
                    Autorização para mediar disputas
                  </li>
                  <li className="flex items-center">
                    <Coins className="mr-2 h-4 w-4 text-yellow-500" />
                    100 MP4 por disputa resolvida
                  </li>
                  <li className="flex items-center">
                    <Vote className="mr-2 h-4 w-4 text-blue-500" />
                    Peso extra na governança
                  </li>
                  <li className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-purple-500" />
                    Acesso a funcionalidades exclusivas
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Recompensas</CardTitle>
              <CardDescription>
                Ganhe MP4 tokens por suas atividades na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-center space-y-2">
                    <Coins className="mx-auto h-8 w-8 text-blue-500" />
                    <h3 className="font-semibold">Registar Obra</h3>
                    <p className="text-2xl font-bold text-blue-600">10 MP4</p>
                    <p className="text-xs text-muted-foreground">Por obra registada</p>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="text-center space-y-2">
                    <Shield className="mx-auto h-8 w-8 text-green-500" />
                    <h3 className="font-semibold">Mediar Disputa</h3>
                    <p className="text-2xl font-bold text-green-600">100 MP4</p>
                    <p className="text-xs text-muted-foreground">Por resolução</p>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="text-center space-y-2">
                    <Vote className="mx-auto h-8 w-8 text-purple-500" />
                    <h3 className="font-semibold">Votar</h3>
                    <p className="text-2xl font-bold text-purple-600">5 MP4</p>
                    <p className="text-xs text-muted-foreground">Por voto em proposta</p>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="text-center space-y-2">
                    <Users className="mx-auto h-8 w-8 text-orange-500" />
                    <h3 className="font-semibold">Referência</h3>
                    <p className="text-2xl font-bold text-orange-600">25 MP4</p>
                    <p className="text-xs text-muted-foreground">Por novo utilizador</p>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="text-center space-y-2">
                    <Zap className="mx-auto h-8 w-8 text-yellow-500" />
                    <h3 className="font-semibold">Criar Proposta</h3>
                    <p className="text-2xl font-bold text-yellow-600">50 MP4</p>
                    <p className="text-xs text-muted-foreground">Por proposta criada</p>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="text-center space-y-2">
                    <TrendingUp className="mx-auto h-8 w-8 text-red-500" />
                    <h3 className="font-semibold">Multiplicadores</h3>
                    <p className="text-2xl font-bold text-red-600">2x</p>
                    <p className="text-xs text-muted-foreground">Early adopters</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas do Token</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Market Cap</span>
                  <span className="font-semibold">$2.5M USD</span>
                </div>
                <div className="flex justify-between">
                  <span>Preço Atual</span>
                  <span className="font-semibold">$0.125 USD</span>
                </div>
                <div className="flex justify-between">
                  <span>Holders</span>
                  <span className="font-semibold">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span>Tokens em Staking</span>
                  <span className="font-semibold">2.5M MP4</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Atividade da Rede</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Propostas Ativas</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex justify-between">
                  <span>Mediadores Ativos</span>
                  <span className="font-semibold">25</span>
                </div>
                <div className="flex justify-between">
                  <span>Recompensas Distribuídas</span>
                  <span className="font-semibold">125K MP4</span>
                </div>
                <div className="flex justify-between">
                  <span>Tokens Queimados</span>
                  <span className="font-semibold">50K MP4</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
