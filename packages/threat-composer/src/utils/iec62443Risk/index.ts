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
import {
  IEC62443RiskLevel,
  IEC62443ThreatAssessment,
  IEC62443_RISK_LEVELS,
} from '../../customTypes';

/**
 * Matrice di rischio 4x4: RISK_MATRIX[likelihood - 1][damage - 1].
 * Likelihood: 1 Improbabile, 2 Possibile, 3 Probabile, 4 Frequente.
 * Damage: 1 Trascurabile, 2 Marginale, 3 Critico, 4 Catastrofico.
 */
export const IEC62443_RISK_MATRIX: IEC62443RiskLevel[][] = [
  ['Basso', 'Basso', 'Medio', 'Medio'],
  ['Basso', 'Medio', 'Medio', 'Alto'],
  ['Medio', 'Medio', 'Alto', 'Critico'],
  ['Medio', 'Alto', 'Critico', 'Critico'],
];

/**
 * Il business damage complessivo è il massimo tra le dimensioni HSE, produzione e finanziaria.
 */
export const computeBusinessDamage = (assessment: IEC62443ThreatAssessment): number | undefined => {
  const dimensions = [assessment.hse, assessment.production, assessment.financial].filter((d): d is number => !!d);
  return dimensions.length > 0 ? Math.max(...dimensions) : undefined;
};

export const computeRiskLevel = (damage?: number, likelihood?: number): IEC62443RiskLevel | undefined => {
  if (!damage || !likelihood) {
    return undefined;
  }
  return IEC62443_RISK_MATRIX[likelihood - 1][damage - 1];
};

export const isRiskTolerable = (risk?: IEC62443RiskLevel, toleranceLevel?: IEC62443RiskLevel): boolean | undefined => {
  if (!risk || !toleranceLevel) {
    return undefined;
  }
  return IEC62443_RISK_LEVELS.indexOf(risk) <= IEC62443_RISK_LEVELS.indexOf(toleranceLevel);
};
