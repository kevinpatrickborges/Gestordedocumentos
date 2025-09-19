import { useState } from 'react';
import { apiService } from '@/services/api';
import { ImportResultDto } from '@/types';

export const useDesarquivamentosImport = (onImportSuccess?: () => void) => {
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResultDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileImport = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setImportResult(null);

    try {
      const result = await apiService.importDesarquivamentos(file);
      setImportResult(result.data || result);
      
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao importar a planilha.');
    } finally {
      setIsLoading(false);
    }
  };

  const openImportModal = () => {
    setImportModalOpen(true);
    setError(null);
    setImportResult(null);
  };

  const closeImportModal = () => {
    setImportModalOpen(false);
  };

  return {
    isImportModalOpen,
    isLoading,
    isPending: isLoading, // Alias para compatibilidade
    importResult,
    error,
    handleFileImport,
    openImportModal,
    closeImportModal,
  };
};