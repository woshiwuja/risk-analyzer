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
import requirementsJson from './requirements4_2.json';

export interface IEC62443_4_2Requirement {
  id: string;
  section: string;
  name: string;
  description: string;
  validation: string;
  /** Capability Security Levels per cui il requisito è richiesto (vuoto = sempre) */
  csl: number[];
  components: {
    softwareApplication: boolean;
    embeddedDevice: boolean;
    hostDevice: boolean;
    networkDevice: boolean;
  };
}

export const IEC62443_4_2_REQUIREMENTS = requirementsJson as IEC62443_4_2Requirement[];

export const IEC62443_4_2_SECTIONS: { id: string; title: string }[] = [
  { id: 'CCSC', title: 'CCSC — Common component security constraints' },
  { id: 'FR 1', title: 'FR 1 — Identification and authentication control (IAC)' },
  { id: 'FR 2', title: 'FR 2 — Use control (UC)' },
  { id: 'FR 3', title: 'FR 3 — System integrity (SI)' },
  { id: 'FR 4', title: 'FR 4 — Data confidentiality (DC)' },
  { id: 'FR 5', title: 'FR 5 — Restricted data flow (RDF)' },
  { id: 'FR 6', title: 'FR 6 — Timely response to events (TRE)' },
  { id: 'FR 7', title: 'FR 7 — Resource availability (RA)' },
];

/**
 * Un requisito è richiesto al Security Level Target dato se il suo CSL minimo è <= SL-T.
 * I requisiti senza CSL esplicito si considerano sempre applicabili.
 */
export const isRequirementInSlTarget = (requirement: IEC62443_4_2Requirement, slTarget?: number): boolean => {
  if (!slTarget || requirement.csl.length === 0) {
    return true;
  }
  return Math.min(...requirement.csl) <= slTarget;
};
