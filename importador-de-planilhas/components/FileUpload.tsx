
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { Spinner } from './Spinner';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading, error }) => {
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
    ? 'border-blue-500'
    : error
    ? 'border-red-500'
    : 'border-gray-300 dark:border-gray-600';

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
      <label
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center w-full h-64 border-2 ${borderStyle} border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300`}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Spinner />
            <p className="text-lg text-gray-500 dark:text-gray-400">Processando seu arquivo...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <UploadIcon />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Clique para enviar</span> ou arraste e solte
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">XLSX, XLS, ou CSV</p>
          </div>
        )}
        <input 
          id="dropzone-file" 
          type="file" 
          className="hidden" 
          onChange={handleFileChange} 
          accept=".xlsx, .xls, .csv" 
          disabled={isLoading}
        />
      </label>
      {error && (
        <p className="mt-4 text-center text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};
