import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  FolderOpen,
  Upload,
  Filter,
  Download,
  Eye,
  Plus,
  FileSpreadsheet,
  Image,
  Grid3X3,
  List,
  Tag,
  MapPin,
  Calendar,
  Hash
} from 'lucide-react'
import { SearchInput } from '@/components/ui/SearchInput'
import { cn } from '@/utils/cn'

interface Pasta {
  id: string
  nome: string
  descricao: string
  imagens: number
  planilhas: number
  dataCriacao: string
  tags: string[]
}

interface Caixa {
  id: string
  numero: string
  conteudo: string
  localizacao: string
  prateleira: string
  pasta: string
  dataArquivamento: string
  responsavel: string
  observacoes?: string
}

const ArquivoPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('todos')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'pastas' | 'planilhas' | 'caixas'>('pastas')

  // Mock data
  const [pastas] = useState<Pasta[]>([
    {
      id: '1',
      nome: 'Prateleira A - Setor 1',
      descricao: 'Documentos administrativos 2023',
      imagens: 15,
      planilhas: 2,
      dataCriacao: '2024-01-15',
      tags: ['administrativo', '2023', 'setor1']
    },
    {
      id: '2',
      nome: 'Prateleira B - Setor 2',
      descricao: 'Processos judiciais arquivados',
      imagens: 28,
      planilhas: 3,
      dataCriacao: '2024-01-20',
      tags: ['judicial', 'processos', 'setor2']
    }
  ])

  const [caixas] = useState<Caixa[]>([
    {
      id: '1',
      numero: 'CX-001',
      conteudo: 'Processos administrativos 2023',
      localizacao: 'Prateleira A - Posição 1',
      prateleira: 'A',
      pasta: 'Prateleira A - Setor 1',
      dataArquivamento: '2024-01-15',
      responsavel: 'João Silva',
      observacoes: 'Documentos em bom estado'
    },
    {
      id: '2',
      numero: 'CX-002',
      conteudo: 'Laudos técnicos 2023',
      localizacao: 'Prateleira A - Posição 2',
      prateleira: 'A',
      pasta: 'Prateleira A - Setor 1',
      dataArquivamento: '2024-01-16',
      responsavel: 'Maria Santos'
    }
  ])

  const filteredPastas = pastas.filter(pasta =>
    pasta.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pasta.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pasta.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredCaixas = caixas.filter(caixa =>
    caixa.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caixa.conteudo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caixa.localizacao.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <FolderOpen className="h-8 w-8 text-primary" />
              Arquivo - NUGECID/SAG
            </h1>
            <p className="text-muted-foreground mt-2">
              Sistema de gerenciamento do acervo documental do Núcleo de Gestão do Conhecimento, Informação, Documentação e Memória
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Pasta
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Pastas</p>
                <p className="text-2xl font-bold text-foreground">{pastas.length}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Imagens</p>
                <p className="text-2xl font-bold text-foreground">{pastas.reduce((acc, pasta) => acc + pasta.imagens, 0)}</p>
              </div>
              <Image className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Planilhas</p>
                <p className="text-2xl font-bold text-foreground">{pastas.reduce((acc, pasta) => acc + pasta.planilhas, 0)}</p>
              </div>
              <FileSpreadsheet className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Caixas</p>
                <p className="text-2xl font-bold text-foreground">{caixas.length}</p>
              </div>
              <Hash className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('pastas')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'pastas'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
            )}
          >
            <FolderOpen className="h-4 w-4 inline mr-2" />
            Pastas e Prateleiras
          </button>
          <button
            onClick={() => setActiveTab('planilhas')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'planilhas'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
            )}
          >
            <FileSpreadsheet className="h-4 w-4 inline mr-2" />
            Planilhas de Controle
          </button>
          <button
            onClick={() => setActiveTab('caixas')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'caixas'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
            )}
          >
            <Hash className="h-4 w-4 inline mr-2" />
            Registro de Caixas
          </button>
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex-1 sm:w-80">
            <SearchInput
              placeholder={`Buscar ${activeTab === 'pastas' ? 'pastas' : activeTab === 'planilhas' ? 'planilhas' : 'caixas'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        {activeTab === 'pastas' && (
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'pastas' && (
        <div className={cn(
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        )}>
          {filteredPastas.map((pasta) => (
            <Card key={pasta.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{pasta.nome}</CardTitle>
                      <CardDescription>{pasta.descricao}</CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Image className="h-4 w-4 text-green-500" />
                        {pasta.imagens} imagens
                      </span>
                      <span className="flex items-center gap-1">
                        <FileSpreadsheet className="h-4 w-4 text-orange-500" />
                        {pasta.planilhas} planilhas
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Criado em {new Date(pasta.dataCriacao).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pasta.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'caixas' && (
        <Card>
          <CardHeader>
            <CardTitle>Registro de Caixas Documentais</CardTitle>
            <CardDescription>
              Controle detalhado das caixas arquivadas com suas respectivas localizações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Número</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Conteúdo</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Localização</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Responsável</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Data</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCaixas.map((caixa) => (
                    <tr key={caixa.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{caixa.numero}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{caixa.conteudo}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {caixa.localizacao}
                        </div>
                      </td>
                      <td className="py-3 px-4">{caixa.responsavel}</td>
                      <td className="py-3 px-4">
                        {new Date(caixa.dataArquivamento).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'planilhas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Upload de Planilha</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Faça upload de uma nova planilha de controle
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Planilha
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default ArquivoPage