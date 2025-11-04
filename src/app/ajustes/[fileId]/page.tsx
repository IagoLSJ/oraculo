"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, AlertCircle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Componente principal da página, agora como Client Component
export default function AjustesPage({ params }: { params: Promise<{ fileId: string }> }) {
  const router = useRouter();
  const { fileId } = use(params);

  // --- ESTADOS GLOBAIS DA PÁGINA ---
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // --- ESTADOS DE INTERATIVIDADE (Lógica da antiga 'AjustesView') ---
  const [selectedUnidades, setSelectedUnidades] = useState<string[]>([]);
  const [selectedSemestre, setSelectedSemestre] = useState<string>("");
  const [gridData, setGridData] = useState<{ headers: string[], rows: any[][] } | null>(null);
  const [isValidationAlertOpen, setIsValidationAlertOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  // --- LÓGICA DE BUSCA DE DADOS (Movida para cá) ---
  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      setFetchError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
      
      try {
        const response = await fetch(`${apiUrl}/api/files/${fileId}/details`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro ${response.status}`);
        }
                 const data = await response.json();
         
         setInitialData(data);
         setGridData(data.preview_data); // Popula a tabela com os dados recebidos
             } catch (error: any) {
         console.error('Erro ao buscar dados:', error);
         setFetchError(error.message);
       } finally {
         setIsLoading(false);
       }
    };

    fetchDetails();
  }, [fileId]); // Roda sempre que o fileId mudar

  // --- FUNÇÕES DE MANIPULAÇÃO DE DADOS ---
  const handleUnidadeChange = (unidade: string) => {
    setSelectedUnidades(prev => prev.includes(unidade) ? prev.filter(u => u !== unidade) : [...prev, unidade]);
  };

  const handleRowRemove = (rowIndexToRemove: number) => {
    if (!gridData) return;
    setGridData(prevData => ({
      ...prevData!,
      rows: prevData!.rows.filter((_, index) => index !== rowIndexToRemove),
    }));
  };

  const handleCellEdit = (rowIndex: number, cellIndex: number, newValue: string) => {
    if (!gridData) return;
    setGridData(prevData => {
      const newRows = [...prevData!.rows];
      newRows[rowIndex][cellIndex] = newValue;
      return { ...prevData!, rows: newRows };
    });
  };

  // --- FUNÇÃO DE ANÁLISE ---
  const handleGerarAnalise = async () => {
    if (!selectedSemestre || selectedUnidades.length === 0) {
      setIsValidationAlertOpen(true);
      return;
    }
    setIsAnalyzing(true);
    setAnalysisError('');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
    const payload = { params: { selectedUnidades, selectedSemestre }, data: gridData };

    try {
      const response = await fetch(`${apiUrl}/api/analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Erro na análise.');
      result.split_date = Number(result.split_date);
      localStorage.setItem('analysisResults', JSON.stringify(result));
      router.push('/resultados');
    } catch (error: any) {
      setAnalysisError(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- RENDERIZAÇÃO CONDICIONAL ---
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
        <p className="mt-4 text-lg">Carregando dados da análise...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Erro ao Carregar Dados</h1>
        <p className="text-red-600 bg-red-100 p-4 rounded-md text-center">{fetchError}</p>
        <Button onClick={() => router.push('/')} className="mt-4">Voltar para o Upload</Button>
      </div>
    );
  }

     if (!initialData || !gridData) {
     return <div>Nenhum dado para exibir. initialData: {JSON.stringify(initialData)}, gridData: {JSON.stringify(gridData)}</div>;
   }

  // --- RENDERIZAÇÃO PRINCIPAL DA PÁGINA ---
  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Ajustes da Análise</h1>
        <p className="text-muted-foreground">
          ID do Arquivo: <span className="font-medium text-primary break-all">{fileId}</span>
        </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>1. Selecione as Unidades</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-48 w-full rounded-md border p-4">
              {initialData.unidades.map((unidade: string) => (
                <div key={unidade} className="flex items-center space-x-2 mb-2">
                  <Checkbox id={unidade} onCheckedChange={() => handleUnidadeChange(unidade)} />
                  <label htmlFor={unidade} className="text-sm font-medium leading-none cursor-pointer">{unidade}</label>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>2. Defina o Período</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">Semestre de Corte</p>
            <Select onValueChange={setSelectedSemestre}>
              <SelectTrigger><SelectValue placeholder="Selecione um semestre..." /></SelectTrigger>
              <SelectContent>
                {initialData.semestres.map((semestre: string) => <SelectItem key={semestre} value={semestre}>{semestre}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">(?) Dados até este semestre serão usados para treino.</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 mb-8 flex justify-end">
        <Button size="lg" onClick={handleGerarAnalise} disabled={isAnalyzing}>
          {isAnalyzing ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" /><span>Analisando...</span>
            </div>
          ) : 'Gerar Análise →'}
        </Button>
      </div>
      <Card>
        <CardHeader><CardTitle>Pré-visualização e Edição dos Dados</CardTitle></CardHeader>
        <CardContent>
          <ScrollArea className="w-full whitespace-nowrap rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Semestre</TableHead>
                  <TableHead>Unidade Acadêmica</TableHead>
                  <TableHead>Taxa de Evasão</TableHead>
                  <TableHead>Taxa de Retenção (Prazo Padrão)</TableHead>
                  <TableHead>Taxa de Retenção II (Prazo Máximo)</TableHead>
                  <TableHead>Matrículas</TableHead>
                  <TableHead className="w-[50px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gridData.rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Input type="text" value={cell} onChange={(e) => handleCellEdit(rowIndex, cellIndex, e.target.value)} className="h-8" />
                      </TableCell>
                    ))}
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>Esta ação não pode ser desfeita. A linha será removida.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRowRemove(rowIndex)}>Continuar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="h-8" />
          </ScrollArea>
        </CardContent>
      </Card>

      {analysisError && (
          <div className="my-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              <strong>Erro na Análise:</strong> {analysisError}
          </div>
      )}

      

      <AlertDialog open={isValidationAlertOpen} onOpenChange={setIsValidationAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Campos Obrigatórios</AlertDialogTitle>
            <AlertDialogDescription>Por favor, selecione o semestre de corte e ao menos uma unidade.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsValidationAlertOpen(false)}>Entendi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}