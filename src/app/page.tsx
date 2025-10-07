"use client";

import { useState } from "react";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateFile = (file: File): boolean => {
    const maxSize = 16 * 1024 * 1024; // 16MB (para corresponder ao backend)
    
    if (file.size > maxSize) {
      setErrorMessage('Arquivo muito grande. Máximo permitido: 16MB');
      return false;
    }
    
    // Simplificando a validação para o nome do arquivo, que é mais confiável
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrorMessage('Apenas arquivos CSV são aceitos');
      return false;
    }
    
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setErrorMessage('');
      setUploadStatus('idle');
      
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setErrorMessage('');
      setUploadStatus('idle');
      
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  // ### LÓGICA DE UPLOAD MODIFICADA ###
  const handleSubmit = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
      const response = await fetch(`${apiUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro desconhecido no servidor.');
      }
      
      setUploadStatus('success');
      console.log('Arquivo enviado com sucesso. ID:', result.fileId);
      
      // Redireciona para a página de ajustes após um breve delay
      setTimeout(() => {
        router.push(`/ajustes/${result.fileId}`);
      }, 1500);

    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error.message || 'Erro ao enviar arquivo. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <main className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Carregar dados estatísticos
          </h2>
          <p className="text-sm text-gray-600">
            Faça upload do seu arquivo CSV para análise
          </p>
        </div>

        <label
          className={`
            block border-2 rounded-lg p-8 mb-4 cursor-pointer transition-all duration-200
            ${isDragOver 
              ? 'border-blue-500 bg-blue-50' 
              : file 
                ? 'border-green-400 bg-green-50' 
                : 'border-dashed border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="text-center">
            {file ? (
              <div className="space-y-2">
                <FileText className="mx-auto w-8 h-8 text-green-600" />
                <div>
                  <p className="font-medium text-gray-700 truncate">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="mx-auto w-8 h-8 text-gray-400" />
                <div>
                  <p className="font-semibold text-gray-700">
                    Arraste o arquivo CSV aqui
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    ou clique para selecionar
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <input
            type="file"
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />
        </label>

        {/* Status Messages */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        {uploadStatus === 'success' && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-700">Arquivo recebido! Redirecionando...</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!file || isUploading || uploadStatus === 'success'}
          className={`
            w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
            ${(!file || isUploading || uploadStatus === 'success')
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
            }
          `}
        >
          {isUploading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Enviando...</span>
            </div>
          ) : uploadStatus === 'success' ? (
            'Redirecionando...'
          ) : (
            'Enviar e analisar'
          )}
        </button>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Aceitamos apenas arquivos CSV (máximo 16MB)
          </p>
        </div>
      </div>
    </main>
  );
}