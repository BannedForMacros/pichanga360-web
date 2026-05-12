'use client'

import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'

export interface ConsultaDniResult {
  first_name: string
  first_last_name: string
  second_last_name: string
  full_name: string
  document_number: string
}

export interface ConsultaRucResult {
  razon_social: string
  numero_documento: string
  estado: string
  condicion: string
  direccion: string
  ubigeo: string
  via_tipo: string
  via_nombre: string
  zona_codigo: string
  zona_tipo: string
  numero: string
  interior: string
  lote: string
  dpto: string
  manzana: string
  kilometro: string
  distrito: string
  provincia: string
  departamento: string
  es_agente_retencion: boolean
  es_buen_contribuyente: boolean
}

/**
 * Backend: GET /decolecta/dni/:numero (RENIEC, requiere DECOLECTA_TOKEN).
 * Usado para autocompletar nombre y apellido al crear un cliente walk-in.
 */
export function useConsultarDni() {
  return useMutation<ConsultaDniResult, Error, string>({
    mutationFn: async (numero: string) => {
      const { data } = await api.get<ConsultaDniResult>(
        `/decolecta/dni/${numero}`,
      )
      return data
    },
  })
}

/**
 * Backend: GET /decolecta/ruc/:numero (SUNAT, requiere DECOLECTA_TOKEN).
 * Usado para autocompletar razón social al registrar la empresa.
 */
export function useConsultarRuc() {
  return useMutation<ConsultaRucResult, Error, string>({
    mutationFn: async (numero: string) => {
      const { data } = await api.get<ConsultaRucResult>(
        `/decolecta/ruc/${numero}`,
      )
      return data
    },
  })
}
