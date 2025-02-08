export const COMPANIAS = [
  'Compañía1',
  'Compañía2',
  'Compañía3',
  'Compañía4',
  'Compañía5'
] as const;

export const SECCIONES = [
  'automotor',
  'robo',
  'responsabilidad civil',
  'combinado familiar',
  'integral para comercio'
] as const;

export type Compania = (typeof COMPANIAS)[number];
export type Seccion = (typeof SECCIONES)[number];

export interface IPolicy {
  id?: number;
  id_compania?: number;
  numero_poliza: number;
  nombre_compania: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  prima: number;
  seccion: string;
  estado: number;
}

export interface IPolicyCreate {
  numero_poliza: number;
  nombre_compania: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  prima: number;
  seccion: string;
}

export type Poliza = IPolicy;

export const PolicySections = {
  AUTOMOTOR: 'Automotor',
  VIDA: 'Vida',
  HOGAR: 'Hogar',
  COMERCIO: 'Comercio',
} as const;

export type PolicySection = keyof typeof PolicySections;

const policyConfig = {
  sections: PolicySections,
  status: {
    ACTIVE: 1,
    INACTIVE: 0
  }
};

export default policyConfig;