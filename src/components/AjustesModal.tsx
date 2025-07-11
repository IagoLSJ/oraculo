// src/components/AjustesModal.tsx
"use client";

import React, { useState, useEffect } from 'react';

// Interfaces para os tipos de dados
interface TableRow {
  id: number;
  [key: string]: any; // Permite colunas dinâmicas (nome, curso, etc.)
}

interface AjustesModalProps {
  onClose: () => void;
  // onAnalyze agora recebe todos os dados necessários para a API
  onAnalyze: (csvContent: string, filters: string[], maxSemester: string) => void;
  file: File | null; // Passamos o objeto File completo
}

interface ValidationErrors {
  [key: string]: boolean;
}

const AjustesModal: React.FC<AjustesModalProps> = ({ onClose, onAnalyze, file }) => {
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]); // Para armazenar os cabeçalhos das colunas
  const [editingRowId, setEditingRowId] = useState<number | null>(null); // ID da linha sendo editada
  const [newRowData, setNewRowData] = useState<TableRow | null>(null); // Dados para uma nova linha
  const [selectedCampuses, setSelectedCampuses] = useState<string[]>([]);
  const [maxSemester, setMaxSemester] = useState<string>('2019.1'); // Valor inicial conforme protótipo
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [availableCampuses, setAvailableCampuses] = useState<string[]>([]);

  // Função para extrair campus únicos da tabela
  const extractAvailableCampuses = (data: TableRow[]): string[] => {
    const campusColumn = headers.find(header => 
      header.toLowerCase().includes('campus') || 
      header.toLowerCase().includes('unidade') ||
      header.toLowerCase().includes('local')
    );
    
    if (!campusColumn) return [];
    
    const campuses = data
      .map(row => row[campusColumn])
      .filter(campus => campus && String(campus).trim() !== '')
      .map(campus => String(campus).trim());
    
    return [...new Set(campuses)].sort(); // Remove duplicatas e ordena
  };

  // Atualiza campus disponíveis sempre que os dados da tabela mudarem
  useEffect(() => {
    const campuses = extractAvailableCampuses(tableData);
    setAvailableCampuses(campuses);
    
    // Remove campus selecionados que não existem mais na tabela
    setSelectedCampuses(prev => prev.filter(campus => campuses.includes(campus)));
  }, [tableData, headers]);

  useEffect(() => {
    if (file) {
      setIsLoading(true);
      setLoadError(null);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          if (!content) {
            throw new Error('Arquivo vazio ou não foi possível ler o conteúdo');
          }

          // Parsing mais robusto para CSV
          const lines = content.split('\n').filter(line => line.trim() !== '');
          if (lines.length === 0) {
            throw new Error('Arquivo não contém dados válidos');
          }

          if (lines.length < 1) { // Apenas cabeçalho é suficiente, sem linha de dados para um CSV vazio.
            // No entanto, para análise, precisa de dados.
            throw new Error('Arquivo deve conter pelo menos cabeçalho.');
          }

          const parsedHeaders = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          if (parsedHeaders.length === 0 || parsedHeaders.every(h => h === '')) {
            throw new Error('Cabeçalhos não encontrados ou são inválidos');
          }
          
          setHeaders(parsedHeaders);

          const parsedData: TableRow[] = lines.slice(1).map((line, index) => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const row: TableRow = { id: Date.now() + index }; // ID único baseado em timestamp
            parsedHeaders.forEach((header, i) => {
              row[header] = values[i] || ''; // Atribui valores, tratando undefined
            });
            return row;
          }).filter(row => {
            // Remove linhas completamente vazias (útil para o final do CSV)
            return Object.keys(row).some(key => key !== 'id' && row[key] !== '');
          });

          setTableData(parsedData);
        } catch (error) {
          console.error('Erro ao processar arquivo:', error);
          setLoadError(error instanceof Error ? error.message : 'Erro desconhecido ao processar arquivo');
          // Fallback para dados mock em caso de erro, caso o arquivo não seja CSV válido
          setHeaders(['Nome', 'Curso', 'Campus', 'Semestre', 'taxa_evasao']); // Adicione taxa_evasao para simular dados de evasão
          setTableData([
            { id: 1, Nome: 'João', Curso: 'Engenharia', Campus: 'Quixadá', Semestre: '2020.1', taxa_evasao: 10 },
            { id: 2, Nome: 'Maria', Curso: 'Medicina', Campus: 'Russas', Semestre: '2019.2', taxa_evasao: 12 },
            { id: 3, Nome: 'Pedro', Curso: 'Direito', Campus: 'Itapajé', Semestre: '2021.1', taxa_evasao: 15 },
          ]);
        } finally {
          setIsLoading(false);
        }
      };

      reader.onerror = () => {
        setLoadError('Erro ao ler o arquivo');
        setIsLoading(false);
      };

      // Assume que é CSV para este exemplo
      reader.readAsText(file);
    } else {
      // Dados mock para testes se nenhum arquivo for carregado (e.g., vindo da página de gráficos)
      setHeaders(['Nome', 'Curso', 'Campus', 'Semestre', 'taxa_evasao']);
      setTableData([
        { id: 1, Nome: 'João', Curso: 'Engenharia', Campus: 'Quixadá', Semestre: '2020.1', taxa_evasao: 10 },
        { id: 2, Nome: 'Maria', Curso: 'Medicina', Campus: 'Russas', Semestre: '2019.2', taxa_evasao: 12 },
        { id: 3, Nome: 'Pedro', Curso: 'Direito', Campus: 'Itapajé', Semestre: '2021.1', taxa_evasao: 15 },
      ]);
      setIsLoading(false);
    }
  }, [file]);

  // Função para validar se todos os campos obrigatórios estão preenchidos
  const validateRowData = (rowData: TableRow): ValidationErrors => {
    const errors: ValidationErrors = {};
    headers.forEach(header => {
      // Exclua 'id' da validação de preenchimento
      if (header !== 'id' && (!rowData[header] || String(rowData[header]).trim() === '')) {
        errors[header] = true;
      }
    });
    return errors;
  };

  // Função para validar semestre (formato básico)
  const validateSemester = (semester: string): boolean => {
    const semesterRegex = /^\d{4}\.[12]$/; // Formato: YYYY.1 ou YYYY.2
    return semesterRegex.test(semester.trim());
  };

  // --- Funções da Tabela ---

  const handleEdit = (id: number) => {
    // Cancela edição anterior se houver
    if (editingRowId !== null && editingRowId !== id) {
      handleCancelEdit();
    }
    
    setEditingRowId(id);
    const rowToEdit = tableData.find(row => row.id === id);
    if (rowToEdit) {
      setNewRowData({ ...rowToEdit }); // Preenche o formulário de edição com os dados da linha
      setValidationErrors({}); // Limpa erros de validação
    }
  };

  const handleRemove = (id: number) => {
    // Confirma remoção
    if (window.confirm('Tem certeza que deseja remover esta linha?')) {
      setTableData(prevData => prevData.filter(row => row.id !== id));
      
      // Se estava editando a linha removida, cancela a edição
      if (editingRowId === id) {
        setEditingRowId(null);
        setNewRowData(null);
        setValidationErrors({});
      }
    }
  };

  const handleAddRow = () => {
    // Cancela edição anterior se houver
    if (editingRowId !== null) {
      // Se a linha anterior era nova e não salva, remova-a antes de adicionar uma nova.
      if (newRowData && !tableData.some(row => row.id === newRowData.id)) {
          setTableData(prevData => prevData.filter(row => row.id !== newRowData.id));
      }
      handleCancelEdit();
    }

    // Inicializa uma nova linha vazia com os cabeçalhos
    const newRow: TableRow = { id: Date.now() }; // Usa timestamp como ID único
    headers.forEach(header => { newRow[header] = ''; });
    
    setTableData(prevData => [...prevData, newRow]);
    setEditingRowId(newRow.id); // Começa a editar a nova linha
    setNewRowData(newRow);
    setValidationErrors({});
  };

  const handleCellChange = (e: React.ChangeEvent<HTMLInputElement>, header: string) => {
    if (newRowData) {
      const updatedData = { ...newRowData, [header]: e.target.value };
      setNewRowData(updatedData);
      
      // Remove erro de validação do campo se ele foi preenchido
      if (validationErrors[header] && e.target.value.trim() !== '') {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[header];
          return newErrors;
        });
      }
    }
  };

  const handleSaveRow = (id: number) => {
    if (!newRowData) return;

    // Valida os dados antes de salvar
    const errors = validateRowData(newRowData);
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return; // Não salva se houver erros
    }

    setTableData(prevData =>
      prevData.map(row => (row.id === id ? newRowData : row))
    );
    
    setEditingRowId(null);
    setNewRowData(null);
    setValidationErrors({});
  };

  const handleCancelEdit = () => {
    if (editingRowId !== null && newRowData) {
      // Se é uma nova linha (não existia antes de ser adicionada), remove-a.
      const isActuallyNew = !tableData.some(row => row.id === editingRowId && Object.keys(row).length > 1); // Verifica se a linha já existia com dados
      if (isActuallyNew) {
        setTableData(prevData => prevData.filter(row => row.id !== editingRowId));
      }
    }
    
    setEditingRowId(null);
    setNewRowData(null);
    setValidationErrors({});
  };


  // --- Funções dos Filtros de Campus ---

  const handleToggleCampus = (campus: string) => {
    setSelectedCampuses(prev => {
      if (prev.includes(campus)) {
        return prev.filter(c => c !== campus);
      } else {
        return [...prev, campus];
      }
    });
  };

  const handleSelectAllCampuses = () => {
    setSelectedCampuses([...availableCampuses]);
  };

  const handleDeselectAllCampuses = () => {
    setSelectedCampuses([]);
  };

  // --- Função para converter tableData para CSV string ---
  const convertTableDataToCsv = (data: TableRow[], currentHeaders: string[]): string => {
    if (data.length === 0) return currentHeaders.join(',') + '\n'; // Apenas cabeçalho se não houver dados

    // Filtra headers para remover a coluna 'id'
    const csvHeaders = currentHeaders.filter(header => header !== 'id');
    const headerRow = csvHeaders.join(',');

    const dataRows = data.map(row => {
      return csvHeaders.map(header => {
        const value = row[header];
        // Envolve o valor em aspas se contiver vírgulas ou aspas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          // Duplica as aspas internas e envolve o valor em aspas
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });

    return [headerRow, ...dataRows].join('\n');
  };


  const handleConfirm = () => {
    // Validações antes de confirmar
    if (tableData.length === 0) {
      alert('Não há dados para analisar. Adicione pelo menos uma linha.');
      return;
    }

    if (!validateSemester(maxSemester)) {
      alert('Formato de semestre inválido. Use o formato YYYY.1 ou YYYY.2 (ex: 2019.1)');
      return;
    }

    // Verifica se há alguma linha sendo editada
    if (editingRowId !== null) {
      alert('Finalize a edição da linha atual antes de confirmar.');
      return;
    }

    // Converte os dados da tabela editada para formato CSV
    const csvContent = convertTableDataToCsv(tableData, headers);

    // Passa os dados convertidos para a função onAnalyze do componente pai
    onAnalyze(csvContent, selectedCampuses, maxSemester);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados do arquivo...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-8 relative overflow-y-auto max-h-[90vh]">
        {/* Botão de Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
          aria-label="Fechar modal"
        >
          &times;
        </button>

        <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">Ajustes pré análise</h3>

        {/* Aviso de erro de carregamento */}
        {loadError && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Aviso</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>{loadError}. Usando dados de exemplo para demonstração.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seção da Tabela */}
        <div className="mb-8">
          <h4 className="text-xl font-semibold text-gray-800 mb-3">Tabela com os dados</h4>
          <div className="border border-gray-300 rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {headers.map((header) => (
                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tableData.length === 0 && (
                  <tr>
                    <td colSpan={headers.length + 1} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      Nenhum dado importado ou carregado.
                    </td>
                  </tr>
                )}
                {tableData.map((row) => (
                  <tr key={row.id}>
                    {headers.map((header) => (
                      <td key={`${row.id}-${header}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {editingRowId === row.id ? (
                          <div>
                            <input
                              type="text"
                              value={newRowData?.[header] || ''}
                              onChange={(e) => handleCellChange(e, header)}
                              className={`block w-full rounded-md shadow-sm text-sm ${
                                validationErrors[header] 
                                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                              }`}
                              placeholder={`Digite ${header.toLowerCase()}`}
                            />
                            {validationErrors[header] && (
                              <p className="mt-1 text-xs text-red-600">Campo obrigatório</p>
                            )}
                          </div>
                        ) : (
                          row[header] || '-'
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingRowId === row.id ? (
                        <>
                          <button
                            onClick={() => handleSaveRow(row.id)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3 font-medium"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(row.id)}
                            className="text-blue-600 hover:text-blue-900 mr-3 font-medium"
                            disabled={editingRowId !== null}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleRemove(row.id)}
                            className="text-red-600 hover:text-red-900 font-medium"
                            disabled={editingRowId !== null}
                          >
                            Remover
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-start space-x-3">
            <button
              onClick={handleAddRow}
              disabled={editingRowId !== null}
              className={`px-4 py-2 border rounded-md ${
                editingRowId !== null
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Inserir Nova Linha
            </button>
          </div>
        </div>

        {/* Seção de Filtro de Campus */}
        <div className="mb-8 p-4 border border-gray-300 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-md font-medium text-gray-700">
              Selecione os campus/unidades para análise
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAllCampuses}
                disabled={availableCampuses.length === 0}
                className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Selecionar Todos
              </button>
              <button
                onClick={handleDeselectAllCampuses}
                disabled={selectedCampuses.length === 0}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Limpar Seleção
              </button>
            </div>
          </div>
          
          {availableCampuses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Nenhum campus encontrado na tabela.</p>
              <p className="text-xs mt-1">Certifique-se de que existe uma coluna com "Campus", "Unidade" ou "Local" na tabela.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                {availableCampuses.map((campus) => (
                  <label
                    key={campus}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCampuses.includes(campus)}
                      onChange={() => handleToggleCampus(campus)}
                      className="mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">{campus}</span>
                  </label>
                ))}
              </div>
              
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                <p className="font-medium">
                  {selectedCampuses.length === 0 && (
                    <span className="text-orange-600">⚠️ Nenhum campus selecionado - todos os campus serão incluídos na análise</span>
                  )}
                  {selectedCampuses.length > 0 && selectedCampuses.length < availableCampuses.length && (
                    <span className="text-blue-600">📊 {selectedCampuses.length} de {availableCampuses.length} campus selecionados</span>
                  )}
                  {selectedCampuses.length === availableCampuses.length && availableCampuses.length > 0 && (
                    <span className="text-green-600">✅ Todos os campus selecionados</span>
                  )}
                </p>
                {selectedCampuses.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Campus selecionados:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedCampuses.map((campus) => (
                        <span
                          key={campus}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {campus}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Seção de Semestre Máximo */}
        <div className="mb-8 p-4 border border-gray-300 rounded-lg bg-gray-50">
          <label htmlFor="max-semester" className="block text-md font-medium text-gray-700 mb-2">
            Qual semestre máximo usado para treinar
          </label>
          <input
            type="text"
            id="max-semester"
            value={maxSemester}
            onChange={(e) => setMaxSemester(e.target.value)}
            placeholder="Ex: 2019.1"
            className={`mt-1 pl-2 text-black block w-full rounded-md shadow-sm ${
              validateSemester(maxSemester)
                ? 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                : 'border-red-300 focus:border-red-500 focus:ring-red-500'
            }`}
          />
          {!validateSemester(maxSemester) && (
            <p className="mt-1 text-sm text-red-600">Formato inválido. Use YYYY.1 ou YYYY.2 (ex: 2019.1)</p>
          )}
        </div>

        {/* Botão Confirmar */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleConfirm}
            disabled={editingRowId !== null || !validateSemester(maxSemester) || tableData.length === 0}
            className={`font-semibold py-3 px-12 rounded-lg transition-colors duration-300 text-lg ${
              editingRowId !== null || !validateSemester(maxSemester) || tableData.length === 0
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AjustesModal;