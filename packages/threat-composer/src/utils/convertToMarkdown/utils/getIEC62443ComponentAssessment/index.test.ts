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
import { getIEC62443ComponentAssessmentContent } from '.';
import { DataExchangeFormat } from '../../../../customTypes';

const baseData: DataExchangeFormat = {
  schema: 1,
};

describe('getIEC62443ComponentAssessmentContent', () => {
  test('returns empty string when no component assessment exists', async () => {
    expect(await getIEC62443ComponentAssessmentContent(baseData)).toEqual('');
    expect(await getIEC62443ComponentAssessmentContent({
      ...baseData,
      iec62443Analysis: { findings: [] },
    })).toEqual('');
  });

  test('renders the full requirements tables with assessed statuses', async () => {
    const content = await getIEC62443ComponentAssessmentContent({
      ...baseData,
      iec62443Analysis: {
        findings: [],
        componentAssessment: {
          componentName: 'Gateway Digilink',
          slTarget: 2,
          items: [
            { requirementId: 'FSA-CR 1.1', status: 'satisfiedIntegration', notes: 'Account gestiti dal sistema', effort: '0' },
            { requirementId: 'FSA-CCSC 3', status: 'satisfied' },
          ],
        },
      },
    });

    expect(content).toContain('## Valutazione requisiti componente IEC 62443-4-2');
    expect(content).toContain('Componente in valutazione: **Gateway Digilink**');
    expect(content).toContain('Security Level Target: **SL 2**');
    expect(content).toContain('### CCSC — Common component security constraints');
    expect(content).toContain('### FR 1 — Identification and authentication control (IAC)');
    expect(content).toContain('b. Soddisfatto tramite integrazione nel sistema');
    expect(content).toContain('Account gestiti dal sistema');
    // requirement with CSL "3, 4" not required at SL-T 2
    expect(content).toContain('Non richiesto a SL-T 2');
    expect(content).toContain('Da valutare');
  });
});
