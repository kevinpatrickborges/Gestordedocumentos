import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Calendar, MessageCircle, User, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatDate } from '../../utils/date';

export interface Tarefa {
  id: number;
  titulo: string;
  descricao?: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  prazo?: string;
  tags?: string[];
  responsavel?: {
    id: number;
    nome: string;
    avatar?: string;
  };
  comentarios?: number;
  ordem: number;
}

interface KanbanCardProps {
  tarefa: Tarefa;
  onClick?: (tarefa: Tarefa) => void;
  onEdit?: (tarefa: Tarefa) => void;
  onDelete?: (tarefaId: number) => void;
}

const priorityColors = {
  baixa: 'bg-green-100 text-green-800 border-green-200',
  media: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  alta: 'bg-orange-100 text-orange-800 border-orange-200',
  critica: 'bg-red-100 text-red-800 border-red-200',
};

const priorityIcons = {
  baixa: null,
  media: null,
  alta: <AlertTriangle className="w-3 h-3" />,
  critica: <AlertTriangle className="w-3 h-3" />,
};

export const KanbanCard: React.FC<KanbanCardProps> = ({
  tarefa,
  onClick,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: tarefa.id,
    data: {
      type: 'tarefa',
      tarefa,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue = tarefa.prazo && new Date(tarefa.prazo) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'touch-none',
        isDragging && 'opacity-50'
      )}
    >
      <Card
        className={cn(
          'p-4 cursor-pointer hover:shadow-md transition-all duration-200',
          'border-l-4',
          tarefa.prioridade === 'critica' && 'border-l-red-500',
          tarefa.prioridade === 'alta' && 'border-l-orange-500',
          tarefa.prioridade === 'media' && 'border-l-yellow-500',
          tarefa.prioridade === 'baixa' && 'border-l-green-500',
          isOverdue && 'bg-red-50 border-red-200'
        )}
        onClick={() => onClick?.(tarefa)}
      >
        {/* Header com título e prioridade */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-sm text-gray-900 line-clamp-2 flex-1">
            {tarefa.titulo}
          </h3>
          {tarefa.prioridade !== 'baixa' && (
            <Badge
              variant="outline"
              className={cn(
                'ml-2 text-xs flex items-center gap-1',
                priorityColors[tarefa.prioridade]
              )}
            >
              {priorityIcons[tarefa.prioridade]}
              {tarefa.prioridade}
            </Badge>
          )}
        </div>

        {/* Descrição */}
        {tarefa.descricao && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {tarefa.descricao}
          </p>
        )}

        {/* Tags */}
        {tarefa.tags && tarefa.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tarefa.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs px-2 py-0.5"
              >
                {tag}
              </Badge>
            ))}
            {tarefa.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                +{tarefa.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer com informações adicionais */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            {/* Responsável */}
            {tarefa.responsavel && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <Avatar
                  src={tarefa.responsavel.avatar}
                  alt={tarefa.responsavel.nome}
                  className="w-4 h-4"
                />
                <span className="truncate max-w-16">
                  {tarefa.responsavel.nome.split(' ')[0]}
                </span>
              </div>
            )}

            {/* Comentários */}
            {tarefa.comentarios && tarefa.comentarios > 0 && (
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                <span>{tarefa.comentarios}</span>
              </div>
            )}
          </div>

          {/* Prazo */}
          {tarefa.prazo && (
            <div
              className={cn(
                'flex items-center gap-1',
                isOverdue ? 'text-red-600' : 'text-gray-500'
              )}
            >
              <Calendar className="w-3 h-3" />
              <span>{formatDate(tarefa.prazo, 'dd/MM')}</span>
              {isOverdue && <Clock className="w-3 h-3 text-red-600" />}
            </div>
          )}
        </div>

        {/* Ações rápidas (aparecem no hover) */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-2 flex gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(tarefa);
              }}
            >
              Editar
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(tarefa.id);
              }}
            >
              Excluir
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};