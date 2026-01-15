import { z } from "zod";

const MAX_FILE_SIZE = 16 * 1024 * 1024;

export const FileUploadSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: "Arquivo muito grande. Máximo permitido: 16MB",
  })
  .refine((file) => file.name.toLowerCase().endsWith(".csv"), {
    message: "Apenas arquivos CSV são aceitos",
  });

export const AnalysisPayloadSchema = z.object({
  file_id: z.string().min(1, {
    message: "ID do arquivo é obrigatório.",
  }),
  params: z.object({
    selectedUnidades: z.array(z.string()).min(1, {
      message: "Selecione ao menos uma unidade.",
    }),
    selectedSemestre: z.string().min(1, {
      message: "Selecione um semestre de corte.",
    }),
  }),
  data: z.object({
    headers: z.array(z.string()).min(1),
    rows: z.array(z.array(z.union([z.string(), z.number()]))).min(1),
  }),
});
