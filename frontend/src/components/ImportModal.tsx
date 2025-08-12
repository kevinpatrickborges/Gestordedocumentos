import React, { useState } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useDesarquivamentosImport } from '@/hooks/useDesarquivamentosImport';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Loader2, CheckCircle, XCircle, FileWarning } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

export const ImportModal = ({ isOpen, onClose, onImportSuccess }: ImportModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { isLoading, importResult, error, handleFileImport } = useDesarquivamentosImport(onImportSuccess);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (selectedFile) {
      await handleFileImport(selectedFile);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    onClose();
  };

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (importResult && importResult.errors.length === 0) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (importResult && importResult.errors.length > 0) return <FileWarning className="h-4 w-4 text-yellow-500" />;
    if (error) return <XCircle className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getStatusMessage = () => {
    if (isLoading) return 'Importando planilha...';
    if (importResult) {
      const { totalLines, successCount, errors } = importResult;
      if (errors.length === 0) {
        return `Importação concluída com sucesso! ${successCount} de ${totalLines} registros importados.`;
      } else {
        return `Importação concluída com avisos. ${successCount} de ${totalLines} registros importados com ${errors.length} erro(s).`;
      }
    }
    if (error) return error;
    return null;
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Importar Planilha de Desarquivamentos</AlertDialogTitle>
        </AlertDialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="file-upload">Selecione o arquivo (.xlsx ou .csv)</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              disabled={isLoading}
              className="mt-1"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-1">
                Arquivo selecionado: {selectedFile.name}
              </p>
            )}
          </div>

          {(isLoading || importResult || error) && (
            <Alert className={`${
              importResult && importResult.errors.length === 0 ? 'border-green-200 bg-green-50' :
              importResult && importResult.errors.length > 0 ? 'border-yellow-200 bg-yellow-50' :
              error ? 'border-red-200 bg-red-50' : ''
            }`}>
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <AlertTitle>
                  {isLoading ? 'Processando...' :
                   importResult && importResult.errors.length === 0 ? 'Sucesso' :
                   importResult && importResult.errors.length > 0 ? 'Concluído com Avisos' :
                   error ? 'Erro' : ''}
                </AlertTitle>
              </div>
              <AlertDescription className="mt-2">
                {getStatusMessage()}
              </AlertDescription>
            </Alert>
          )}

          {importResult && importResult.errors.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-sm mb-2">Detalhes dos Erros:</h4>
              <div className="max-h-40 overflow-y-auto border rounded p-2 bg-gray-50">
                {importResult.errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-600 mb-1">
                    <strong>Linha {error.line}:</strong> {error.message}
                    {error.data && (
                      <div className="text-xs text-gray-600 ml-2">
                        Dados: {error.message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            {importResult ? 'Fechar' : 'Cancelar'}
          </Button>
          {!importResult && (
            <Button 
              onClick={handleImport} 
              disabled={!selectedFile || isLoading}
              className="ml-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importando...
                </>
              ) : (
                'Importar'
              )}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};