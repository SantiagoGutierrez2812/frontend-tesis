// services/types/log/log.ts

export interface LogRecord {
  id: number;
  created_at: string;
  message: string; // Se mapea a 'accion' y se usa para inferir 'tipo'
  module: string; // Se mapea a 'usuario' (limpiando el path)
}

export type LogType = "INFO" | "WARNING" | "ERROR";

export interface Log {
    id: number;
    fecha: string;
    usuario: string; 
    accion: string; 
    tipo: LogType;
}