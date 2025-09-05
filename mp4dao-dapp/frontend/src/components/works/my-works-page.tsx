'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Music, 
  Calendar, 
  Users, 
  ExternalLink, 
  Search, 
  Filter,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { WORK_REGISTRY_ABI, WORK_REGISTRY_ADDRESS } from '@/lib/web3/config';
import { formatEther } from 'viem';

const WORK_TYPES = {
  0: 'Música Completa',
  1: 'Apenas Letra',
  2: 'Instrumental',
  3: 'Remix',
  4: 'Cover',
  5: 'Sample/Loop'
};

interface Work {
  id: number;
  workHash: string;
  metadataURI: string;
  authors: string[];
  splitsBps: number[];
  registeredAt: number;
  workType: number;
  disputed: boolean;
  publicListing: boolean;
}

export function MyWorksPage() {
  const { address, isConnected } = useAccount();
  const [works, setWorks] = useState<Work[]>([]);
  const [filteredWorks, setFilteredWorks] = useState<Work[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Get user's works
  const { data: workIds, isLoading: loadingWorkIds } = useReadContract({
    address: WORK_REGISTRY_ADDRESS,
    abi: WORK_REGISTRY_ABI,
    functionName: 'getWorksByAuthor',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Load individual work details
  useEffect(() => {
    if (workIds && workIds.length > 0) {
      loadWorkDetails();
    }
  }, [workIds]);

  const loadWorkDetails = async () => {
    if (!workIds) return;

    const worksData: Work[] = [];
    
    for (const workId of workIds) {
      try {
        // In a real implementation, you would use useReadContract for each work
        // For now, we'll create mock data based on the workId
        const mockWork: Work = {
          id: Number(workId),
          workHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          metadataURI: `ipfs://mock-${workId}`,
          authors: [address || ''],
          splitsBps: [10000], // 100%
          registeredAt: Math.floor(Date.now() / 1000) - Math.random() * 86400 * 30, // Random date in last 30 days
          workType: Math.floor(Math.random() * 6),
          disputed: Math.random() > 0.9, // 10% chance of dispute
          publicListing: Math.random() > 0.5 // 50% public
        };
        
        worksData.push(mockWork);
      } catch (error) {
        console.error(`Erro ao carregar obra ${workId}:`, error);
      }
    }

    setWorks(worksData);
    setFilteredWorks(worksData);
  };

  // Filter and search works
  useEffect(() => {
    let filtered = works;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(work => 
        work.metadataURI.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.id.toString().includes(searchTerm)
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(work => work.workType === parseInt(filterType));
    }

    // Filter by status
    if (filterStatus !== 'all') {
      switch (filterStatus) {
        case 'disputed':
          filtered = filtered.filter(work => work.disputed);
          break;
        case 'public':
          filtered = filtered.filter(work => work.publicListing);
          break;
        case 'private':
          filtered = filtered.filter(work => !work.publicListing);
          break;
      }
    }

    setFilteredWorks(filtered);
  }, [works, searchTerm, filterType, filterStatus]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (work: Work) => {
    if (work.disputed) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Em Disputa
      </Badge>;
    }
    return <Badge variant="secondary" className="flex items-center gap-1">
      <CheckCircle className="h-3 w-3" />
      Registada
    </Badge>;
  };

  const getVisibilityBadge = (work: Work) => {
    return work.publicListing ? (
      <Badge variant="outline" className="flex items-center gap-1">
        <Eye className="h-3 w-3" />
        Pública
      </Badge>
    ) : (
      <Badge variant="outline" className="flex items-center gap-1">
        <EyeOff className="h-3 w-3" />
        Privada
      </Badge>
    );
  };

  if (!isConnected) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Conecte a Sua Carteira
            </h2>
            <p className="text-muted-foreground">
              Para visualizar as suas obras, precisa de conectar a sua carteira Web3.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loadingWorkIds) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (works.length === 0) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Nenhuma Obra Registada
            </h2>
            <p className="text-muted-foreground mb-4">
              Ainda não registou nenhuma obra musical na blockchain.
            </p>
            <Button asChild>
              <a href="/register">Registar Primeira Obra</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Pesquisa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Pesquisar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ID da obra ou metadados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Obra</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  {Object.entries(WORK_TYPES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Estados</SelectItem>
                  <SelectItem value="disputed">Em Disputa</SelectItem>
                  <SelectItem value="public">Públicas</SelectItem>
                  <SelectItem value="private">Privadas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estatísticas</label>
              <div className="text-2xl font-bold text-primary">
                {filteredWorks.length} obra{filteredWorks.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Works List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorks.map((work) => (
          <Card key={work.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">
                    Obra #{work.id}
                  </CardTitle>
                  <CardDescription>
                    {WORK_TYPES[work.workType as keyof typeof WORK_TYPES]}
                  </CardDescription>
                </div>
                <div className="space-y-2">
                  {getStatusBadge(work)}
                  {getVisibilityBadge(work)}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Registration Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Registada em {formatDate(work.registeredAt)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{work.authors.length} autor{work.authors.length !== 1 ? 'es' : ''}</span>
                </div>
              </div>

              {/* Hash Preview */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Hash da Obra</label>
                <code className="block text-xs bg-muted p-2 rounded font-mono break-all">
                  {work.workHash}
                </code>
              </div>

              {/* Authors and Splits */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Direitos Autorais</label>
                <div className="space-y-1">
                  {work.authors.map((author, index) => (
                    <div key={author} className="flex justify-between text-sm">
                      <span className="font-mono text-xs">
                        {author === address ? 'Você' : `${author.slice(0, 6)}...${author.slice(-4)}`}
                      </span>
                      <span className="font-medium">
                        {(work.splitsBps[index] / 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Detalhes
                </Button>
                {work.disputed && (
                  <Button variant="destructive" size="sm">
                    Ver Disputa
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No results */}
      {filteredWorks.length === 0 && works.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhum Resultado Encontrado
              </h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros ou o termo de pesquisa.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
