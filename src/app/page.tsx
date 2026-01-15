"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useRouter } from 'next/navigation'
import { api, ApiError } from "@/lib/api/client";
import { FileUploadSchema } from "@/lib/validation/schemas";

interface FileItem {
  id: string;
  nome: string;
  uploadedAt?: string;
}

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [recentFiles, setRecentFiles] = useState<FileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  // Carrega os últimos 5 arquivos ao montar o componente
  useEffect(() => {
    loadRecentFiles();
  }, []);

  const loadRecentFiles = async () => {
    try {
      setIsLoadingFiles(true);
      const result = await api.listFiles();
      setRecentFiles(result.files || []);
    } catch (error) {
      console.error('Erro ao carregar arquivos recentes:', error);
      setRecentFiles([]);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const validateFile = (file: File): boolean => {
    const result = FileUploadSchema.safeParse(file);
    if (!result.success) {
      const firstError = result.error.errors[0]?.message;
      setErrorMessage(firstError || 'Arquivo inválido');
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setErrorMessage('');
      setUploadStatus('idle');
      setSelectedFileId(null); // Limpa seleção de arquivo existente
      
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
      setSelectedFileId(null); // Limpa seleção de arquivo existente
      
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

  const handleSelectFile = (fileId: string) => {
    setSelectedFileId(fileId);
    setFile(null); // Limpa arquivo selecionado para upload
    setCustomName(''); // Limpa nome personalizado
    setErrorMessage('');
    setUploadStatus('idle');
  };

  const handleSubmit = async () => {
    // Se um arquivo existente foi selecionado, redireciona direto
    if (selectedFileId) {
      router.push(`/ajustes/${selectedFileId}`);
      return;
    }

    // Caso contrário, faz upload do novo arquivo
    if (!file) return;
    
    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      const result = await api.uploadFile(file, customName || undefined);
      
      setUploadStatus('success');
      console.log('Arquivo enviado com sucesso. ID:', result.fileId);
      
      // Recarrega lista de arquivos
      await loadRecentFiles();
      
      // Redireciona para a página de ajustes após um breve delay
      setTimeout(() => {
        router.push(`/ajustes/${result.fileId}`);
      }, 1500);

    } catch (error) {
      setUploadStatus('error');
      let message = 'Erro ao enviar arquivo. Tente novamente.';
      
      if (error instanceof ApiError) {
        // Tratamento específico para erro 409 (arquivo duplicado)
        if (error.status === 409) {
          message = error.message || 'Este arquivo já foi processado anteriormente. Por favor, use um arquivo diferente.';
        } else {
          message = error.message;
        }
      } else if (error instanceof Error) {
        message = error.message;
      }
      
      setErrorMessage(message);
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

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Carregar dados estatísticos
          </h2>
          <p className="text-sm text-gray-600">
            Escolha um arquivo existente ou faça upload de um novo arquivo CSV
          </p>
        </div>

        {/* Lista de arquivos recentes */}
        {recentFiles.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Últimos arquivos enviados
            </h3>
            <div className="space-y-2">
              {recentFiles.map((fileItem) => (
                <button
                  key={fileItem.id}
                  onClick={() => handleSelectFile(fileItem.id)}
                  className={`
                    w-full p-3 rounded-lg border-2 text-left transition-all duration-200
                    ${selectedFileId === fileItem.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="font-medium text-gray-700 truncate">
                        {fileItem.nome}
                      </span>
                    </div>
                    {fileItem.uploadedAt && (
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatDate(fileItem.uploadedAt)}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoadingFiles && (
          <div className="mb-6 text-center text-sm text-gray-500">
            Carregando arquivos...
          </div>
        )}

        {/* Divisor */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">ou</span>
          </div>
        </div>

        {/* Upload de novo arquivo */}
        <div className="mb-4">
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

          {/* Campo de nome personalizado */}
          {file && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome personalizado (opcional)
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Digite um nome para o arquivo"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                Se não informado, será usado o nome do arquivo
              </p>
            </div>
          )}
        </div>

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
          disabled={(!file && !selectedFileId) || isUploading || uploadStatus === 'success'}
          className={`
            w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
            ${((!file && !selectedFileId) || isUploading || uploadStatus === 'success')
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
          ) : selectedFileId ? (
            'Usar arquivo selecionado'
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
