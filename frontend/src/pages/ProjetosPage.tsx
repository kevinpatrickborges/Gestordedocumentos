import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Loading } from '../components/ui/Loading';
import { Alert } from '../components/ui/Alert';
import { Input } from '../components/ui/Input';
import { 
  Plus, 
  Calendar, 
  Users, 
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  Star,
  Filter
} from 'lucide-react';
import { SearchInput } from '@/components/ui/SearchInput';
import { kanbanService } from '../services/kanbanService';
import { toast } from 'sonner';

interface Projeto {
  id: number;
  nome: string;
  descricao?: string;
  cor?: string;
  data_criacao: string;
  data_atualizacao: string;
  ativo: boolean;
  favorito?: boolean;
  total_tarefas?: number;
  total_membros?: number;
  progresso?: number;
}

interface ProjetosPageState {
  projetos: Projeto[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  filterStatus: 'todos' | 'ativos' | 'arquivados' | 'favoritos';
}

const ProjetosPage: React.FC = () => {
  const navigate = useNavigate();
  const { checkPermission } = useAuth();
  
  const [state, setState] = useState<ProjetosPageState>({
    projetos: [],
    loading: true,
    error: null,
    searchTerm: '',
    filterStatus: 'todos'
  });
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Projeto | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Carregar projetos
  const loadProjetos = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await kanbanService.getProjetos();
      
      setState(prev => ({
        ...prev,
        projetos: response.data || [],
        loading: false
      }));
    } catch (error: any) {
      console.error('Erro ao carregar projetos:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Erro ao carregar projetos',
        loading: false
      }));
    }
  };

  useEffect(() => {
    loadProjetos();
  }, []);

  // Filtrar projetos
  const filteredProjetos = state.projetos.filter(projeto => {
    const matchesSearch = projeto.nome.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                         (projeto.descricao?.toLowerCase().includes(state.searchTerm.toLowerCase()) || false);
    
    const matchesFilter = (() => {
      switch (state.filterStatus) {
        case 'ativos':
          return projeto.ativo;
        case 'arquivados':
          return !projeto.ativo;
        case 'favoritos':
          return projeto.favorito;
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesFilter;
  });

  // Handlers
  const handleCreateProject = () => {
    if (!checkPermission('create', 'projetos')) {
      toast.error('Você não tem permissão para criar projetos');
      return;
    }
    setShowCreateModal(true);
  };

  const handleEditProject = (projeto: Projeto) => {
    if (!checkPermission('update', 'projetos')) {
      toast.error('Você não tem permissão para editar projetos');
      return;
    }
    setSelectedProject(projeto);
    setShowEditModal(true);
  };

  const handleDeleteProject = async (projeto: Projeto) => {
    if (!checkPermission('delete', 'projetos')) {
      toast.error('Você não tem permissão para excluir projetos');
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir o projeto "${projeto.nome}"? Esta ação não pode ser desfeita.`)) {
      try {
        await kanbanService.deleteProjeto(projeto.id);
        toast.success('Projeto excluído com sucesso');
        loadProjetos();
      } catch (error: any) {
        console.error('Erro ao excluir projeto:', error);
        toast.error(error.message || 'Erro ao excluir projeto');
      }
    }
  };

  const handleToggleFavorite = async (projeto: Projeto) => {
    try {
      // Implementar toggle favorito quando a API estiver disponível
      toast.info('Funcionalidade em desenvolvimento');
    } catch (error: any) {
      console.error('Erro ao alterar favorito:', error);
      toast.error(error.message || 'Erro ao alterar favorito');
    }
  };

  const handleArchiveProject = async (projeto: Projeto) => {
    try {
      const action = projeto.ativo ? 'arquivar' : 'desarquivar';
      if (window.confirm(`Tem certeza que deseja ${action} o projeto "${projeto.nome}"?`)) {
        // Implementar arquivamento quando a API estiver disponível
        toast.info('Funcionalidade em desenvolvimento');
      }
    } catch (error: any) {
      console.error('Erro ao arquivar projeto:', error);
      toast.error(error.message || 'Erro ao arquivar projeto');
    }
  };

  const handleOpenProject = (projeto: Projeto) => {
    navigate(`/kanban/${projeto.id}`);
  };

  // Formatação de data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Obter cor de progresso
  const getProgressColor = (progresso: number) => {
    if (progresso >= 80) return 'bg-green-500';
    if (progresso >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <h3 className="font-semibold">Erro ao carregar projetos</h3>
          <p>{state.error}</p>
          <div className="mt-4">
            <Button onClick={loadProjetos}>
              Tentar Novamente
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projetos</h1>
          <p className="text-gray-600 mt-1">
            Gerencie seus projetos Kanban
          </p>
        </div>
        
        <Button onClick={handleCreateProject} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Projeto
        </Button>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchInput
            placeholder="Buscar projetos..."
            value={state.searchTerm}
            onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={state.filterStatus === 'todos' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setState(prev => ({ ...prev, filterStatus: 'todos' }))}
          >
            Todos
          </Button>
          <Button
            variant={state.filterStatus === 'ativos' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setState(prev => ({ ...prev, filterStatus: 'ativos' }))}
          >
            Ativos
          </Button>
          <Button
            variant={state.filterStatus === 'favoritos' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setState(prev => ({ ...prev, filterStatus: 'favoritos' }))}
          >
            <Star className="w-4 h-4 mr-1" />
            Favoritos
          </Button>
          <Button
            variant={state.filterStatus === 'arquivados' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setState(prev => ({ ...prev, filterStatus: 'arquivados' }))}
          >
            <Archive className="w-4 h-4 mr-1" />
            Arquivados
          </Button>
        </div>
      </div>

      {/* Lista de Projetos */}
      {filteredProjetos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Filter className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {state.searchTerm || state.filterStatus !== 'todos' 
              ? 'Nenhum projeto encontrado' 
              : 'Nenhum projeto criado'
            }
          </h3>
          <p className="text-gray-600 mb-4">
            {state.searchTerm || state.filterStatus !== 'todos'
              ? 'Tente ajustar os filtros ou termo de busca'
              : 'Crie seu primeiro projeto para começar'
            }
          </p>
          {(!state.searchTerm && state.filterStatus === 'todos') && (
            <Button onClick={handleCreateProject} className="gap-2">
              <Plus className="w-4 h-4" />
              Criar Primeiro Projeto
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjetos.map((projeto) => (
            <Card key={projeto.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    {projeto.cor && (
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: projeto.cor }}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 
                        className="font-semibold text-gray-900 truncate cursor-pointer hover:text-blue-600"
                        onClick={() => handleOpenProject(projeto)}
                      >
                        {projeto.nome}
                      </h3>
                      {projeto.descricao && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {projeto.descricao}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFavorite(projeto)}
                      className={`p-1 ${projeto.favorito ? 'text-yellow-500' : 'text-gray-400'}`}
                    >
                      <Star className="w-4 h-4" fill={projeto.favorito ? 'currentColor' : 'none'} />
                    </Button>
                    
                    <div className="relative group">
                      <Button variant="ghost" size="sm" className="p-1">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                      
                      {/* Menu dropdown - implementar posteriormente */}
                      <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                        <button
                          onClick={() => handleEditProject(projeto)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleArchiveProject(projeto)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <Archive className="w-4 h-4" />
                          {projeto.ativo ? 'Arquivar' : 'Desarquivar'}
                        </button>
                        <button
                          onClick={() => handleDeleteProject(projeto)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(projeto.data_criacao)}
                  </div>
                  {projeto.total_membros !== undefined && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {projeto.total_membros}
                    </div>
                  )}
                </div>

                {/* Progresso */}
                {projeto.progresso !== undefined && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Progresso</span>
                      <span className="font-medium">{projeto.progresso}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getProgressColor(projeto.progresso)}`}
                        style={{ width: `${projeto.progresso}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={projeto.ativo ? 'default' : 'secondary'}>
                      {projeto.ativo ? 'Ativo' : 'Arquivado'}
                    </Badge>
                    {projeto.total_tarefas !== undefined && (
                      <Badge variant="outline">
                        {projeto.total_tarefas} tarefa(s)
                      </Badge>
                    )}
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => handleOpenProject(projeto)}
                    className="gap-2"
                  >
                    Abrir
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modais - serão implementados posteriormente */}
      {/* CreateProjectModal */}
      {/* EditProjectModal */}
    </div>
  );
};

export default ProjetosPage;