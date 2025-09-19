import React, { useCallback, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  error: string | null;
  accept?: string;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  isLoading, 
  error, 
  accept = '.xlsx,.xls,.csv',
  className 
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const borderStyle = isDragging
    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
    : error
    ? 'border-red-500 bg-red-50 dark:bg-red-950'
    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800';

  return (
    <div className={cn("w-full mx-auto", className)}>
      <label
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300",
          borderStyle,
          isLoading && "cursor-not-allowed opacity-60",
          !isLoading && "hover:bg-gray-100 dark:hover:bg-gray-700"
        )}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <p className="text-lg text-gray-500 dark:text-gray-400">Processando seu arquivo...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <Upload className="h-10 w-10 mb-4 text-gray-500 dark:text-gray-400" />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Clique para enviar</span> ou arraste e solte
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {accept.replace(/\./g, '').toUpperCase()}
            </p>
          </div>
        )}
        <input 
          id="dropzone-file" 
          type="file" 
          className="hidden" 
          onChange={handleFileChange} 
          accept={accept}
          disabled={isLoading}
        />
      </label>
      {error && (
        <p className="mt-4 text-center text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};