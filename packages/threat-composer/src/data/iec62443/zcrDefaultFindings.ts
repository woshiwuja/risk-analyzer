/** *******************************************************************************************************************
  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License").
  You may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
 ******************************************************************************************************************** */
import { IEC62443Finding } from '../../customTypes/iec62443';

/**
 * Requisiti ZCR di IEC 62443-3-2 con stato iniziale da valutare manualmente.
 */
export const ZCR_DEFAULT_FINDINGS: IEC62443Finding[] = [
  {
    id: 'zcr-1',
    requirement: 'ZCR 1 — Identificazione del SUC',
    status: 'missing',
    detail: 'Perimetro del System under Consideration non documentato (descrizione e architettura)',
    priority: 'Alta',
  },
  {
    id: 'zcr-2',
    requirement: 'ZCR 2 — Risk assessment iniziale worst-case',
    status: 'missing',
    detail: 'Nessuna valutazione di impatto worst-case (HSE, produzione, finanziario)',
    priority: 'Alta',
  },
  {
    id: 'zcr-3',
    requirement: 'ZCR 3.1–3.6 — Zone e condotti formali',
    status: 'missing',
    detail: 'Nessuna definizione esplicita di zone/conduit; non verificate separazioni safety, dispositivi temporanei, wireless',
    priority: 'Alta',
  },
  {
    id: 'zcr-4',
    requirement: 'ZCR 4 / 6.8 — Rischio tollerabile',
    status: 'missing',
    detail: 'Nessuna soglia di accettabilità definita; decisioni "Resolved" senza criterio formale',
    priority: 'Critica',
  },
  {
    id: 'zcr-5.1',
    requirement: 'ZCR 5.1 — Identificazione delle minacce',
    status: 'missing',
    detail: 'Nessuna minaccia documentata',
    priority: 'Alta',
  },
  {
    id: 'zcr-5.2',
    requirement: 'ZCR 5.2 — Vulnerabilità',
    status: 'missing',
    detail: 'Nessun vulnerability assessment incluso o referenziato',
    priority: 'Media',
  },
  {
    id: 'zcr-5.3',
    requirement: 'ZCR 5.3 — Conseguenza e impatto',
    status: 'missing',
    detail: 'Solo "Priority" generica, nessuna scala di impatto',
    priority: 'Alta',
  },
  {
    id: 'zcr-5.4',
    requirement: 'ZCR 5.4 — Probabilità non mitigata',
    status: 'missing',
    detail: 'Assente: nessuna stima di probabilità non mitigata',
    priority: 'Alta',
  },
  {
    id: 'zcr-5.5',
    requirement: 'ZCR 5.5 — Rischio non mitigato',
    status: 'missing',
    detail: 'Assente (nessuna matrice di rischio)',
    priority: 'Alta',
  },
  {
    id: 'zcr-5.6',
    requirement: 'ZCR 5.6 — SL-T per zona/condotto',
    status: 'missing',
    detail: 'Nessun Security Level Target; nessuna mappatura su SL-C di IEC 62443-3-3',
    priority: 'Critica',
  },
  {
    id: 'zcr-5.7',
    requirement: 'ZCR 5.7 / 5.11 — Confronto con rischio tollerabile',
    status: 'missing',
    detail: 'Impossibile senza soglia di rischio tollerabile e quantificazione del rischio',
    priority: 'Alta',
  },
  {
    id: 'zcr-5.8',
    requirement: 'ZCR 5.8 — Contromisure esistenti',
    status: 'missing',
    detail: 'Nessuna contromisura documentata',
    priority: 'Alta',
  },
  {
    id: 'zcr-5.9',
    requirement: 'ZCR 5.9 / 5.10 — Rivalutazione e rischio residuo',
    status: 'missing',
    detail: 'Nessun rischio residuo documentato post-mitigazione',
    priority: 'Alta',
  },
  {
    id: 'zcr-5.13',
    requirement: 'ZCR 5.13 — Metadati assessment',
    status: 'missing',
    detail: 'Mancano date sessioni, partecipanti e ruoli, classificazione di riservatezza',
    priority: 'Media',
  },
  {
    id: 'zcr-6.4',
    requirement: 'ZCR 6.4 — Caratteristiche zone/condotti',
    status: 'missing',
    detail: 'Mancano: organizzazione accountable, designazione safety, criticità/classificazione asset, lista completa flussi dati per access point',
    priority: 'Media',
  },
  {
    id: 'zcr-6.6',
    requirement: 'ZCR 6.6 — Threat environment',
    status: 'missing',
    detail: 'Nessuna fonte di threat intelligence (ICS-CERT, ISAC, CSIRT) né minacce emergenti',
    priority: 'Media',
  },
  {
    id: 'zcr-6.7',
    requirement: 'ZCR 6.7 — Policy organizzative',
    status: 'missing',
    detail: 'Nessuna policy organizzativa di cybersecurity inclusa o referenziata nel CRS',
    priority: 'Bassa',
  },
  {
    id: 'zcr-7',
    requirement: 'ZCR 7 — Approvazione asset owner',
    status: 'missing',
    detail: 'Nessuna firma/approvazione formale del management',
    priority: 'Media',
  },
];
