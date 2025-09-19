import { useState } from 'react';
import { nugecidService } from '@/services/nugecidService';
import { ImportResultDto } from '@/modules/nugecid/dto/import-result.dto';

export const useNugecidImport = (onImportSuccess?: () => void) => {
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResultDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileImport = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setImportResult(null);

    try {
      const result = await nugecidService.importPlanilha(file);
      setImportResult(result);
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ocorreu um erro ao importar a planilha.');
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
    importResult,
    error,
    handleFileImport,
    openImportModal,
    closeImportModal,
  };
};