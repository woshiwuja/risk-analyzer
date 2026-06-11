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
import { getIEC62443RiskAnalysisContent } from '.';
import { DataExchangeFormat } from '../../../../customTypes';

const baseData: DataExchangeFormat = {
  schema: 1,
  applicationInfo: {
    name: 'Test OT System',
    description: 'A SCADA system controlling a water treatment plant',
  },
  threats: [
    {
      id: '11111111-1111-4111-8111-111111111111',
      numericId: 1,
      statement: 'An external threat actor can tamper with PLC logic',
    },
  ],
};

describe('getIEC62443RiskAnalysisContent', () => {
  test('renders the default manual checklist when no findings are saved', async () => {
    const content = await getIEC62443RiskAnalysisContent(baseData);

    expect(content).toContain('## Analisi del rischio IEC 62443-3-2');
    expect(content).toContain('### Mancante (gap rispetto alla norma)');
    expect(content).toContain('| Requisito norma | Cosa manca | Priorità |');
    expect(content).toContain('Nessun Security Level Target; nessuna mappatura su SL-C di IEC 62443-3-3');
    expect(content).toContain('18 requisiti valutati: 0 coperti, 0 parziali, 18 mancanti.');
    expect(content).not.toContain('✅');
    expect(content).not.toContain('❌');
  });

  test('renders user-provided findings with implementation column', async () => {
    const content = await getIEC62443RiskAnalysisContent({
      ...baseData,
      iec62443Analysis: {
        findings: [{
          id: 'zcr-5.6',
          requirement: 'ZCR 5.6 — SL-T per zona/condotto',
          status: 'covered',
          detail: 'SL-T 2 assegnato alla zona di controllo',
          priority: 'Critica',
          implementation: 'Assegnazione formalizzata nel CRS rev. 2',
        }],
      },
    });

    expect(content).toContain('### Coperto');
    expect(content).toContain('SL-T 2 assegnato alla zona di controllo');
    expect(content).toContain('Assegnazione formalizzata nel CRS rev. 2');
    expect(content).toContain('1 requisiti valutati: 1 coperti, 0 parziali, 0 mancanti.');
  });

  test('renders zones/conduits, tolerability and business damage sections', async () => {
    const content = await getIEC62443RiskAnalysisContent({
      ...baseData,
      iec62443Analysis: {
        findings: [],
        zonesConduits: [{
          id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          name: 'Zona di controllo',
          type: 'Zona',
          description: 'PLC e HMI di linea',
          slT: 'SL 2',
          notes: 'Include funzioni safety',
        }],
        toleranceLevel: 'Medio',
        toleranceJustification: 'Policy aziendale di risk management',
        threatAssessments: [{
          threatId: '11111111-1111-4111-8111-111111111111',
          hse: 1,
          production: 4,
          financial: 2,
          likelihood: 3,
          notes: 'Accesso remoto non segmentato',
        }],
      },
    });

    expect(content).toContain('### Zone e condotti (ZCR 3, ZCR 5.6)');
    expect(content).toContain('| Zona di controllo | Zona |');
    expect(content).toContain('SL 2');
    expect(content).toContain('### Tollerabilità del rischio (ZCR 4, ZCR 6.8)');
    expect(content).toContain('Livello massimo di rischio tollerabile: **Medio**');
    expect(content).toContain('### Business damage e rischio per minaccia');
    // damage = max(1, 4, 2) = 4 Catastrofico; likelihood 3 → risk Critico → not tolerable
    expect(content).toContain('4 — Catastrofico');
    expect(content).toContain('| Critico | **No** |');
  });
});
