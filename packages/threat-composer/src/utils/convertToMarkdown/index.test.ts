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
import convertToMarkdown from '.';
import { DataExchangeFormat } from '../../customTypes';

// parseTableCellContent usa la toolchain unified/rehype (solo ESM), non trasformata da jest
jest.mock('../parseTableCellContent', () => ({
  __esModule: true,
  default: async (content: string) => content,
}));

const data: DataExchangeFormat = {
  schema: 1,
  applicationInfo: {
    name: 'Impianto OT',
    description: 'Sistema di controllo linea 1',
  },
  architecture: {
    description: 'PLC + HMI',
  },
  assumptions: [{
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    numericId: 1,
    content: 'La rete OT è separata dalla rete IT',
  }],
  threats: [{
    id: '11111111-1111-4111-8111-111111111111',
    numericId: 1,
    statement: 'Un attaccante può manomettere la logica del PLC',
    metadata: [{ key: 'Priority', value: 'High' }],
  }],
  mitigations: [{
    id: '22222222-2222-4222-8222-222222222222',
    numericId: 1,
    content: 'Segmentazione di rete',
    status: 'mitigationResolved',
  }],
  iec62443Analysis: {
    findings: [],
    vulnerabilityAssessment: {
      vulnerabilities: [{
        id: 'h/tcp:22/1',
        host: 'h',
        name: 'Obsolete SSH Server',
        severity: 4,
      }],
    },
  },
};

describe('convertToMarkdown report types', () => {
  test('executive: summary and IEC sections, no operational details', async () => {
    const content = await convertToMarkdown(data, 'Full', 'executive');

    expect(content).toContain('## Riepilogo esecutivo');
    expect(content).toContain('### Minacce per priorità');
    expect(content).toContain('### Vulnerabilità per severità');
    expect(content).toContain('## Analisi del rischio IEC 62443-3-2');
    expect(content).not.toContain('## Threats');
    expect(content).not.toContain('## Mitigations');
    expect(content).not.toContain('## Architecture');
    expect(content).not.toContain('## Vulnerability assessment (ZCR 5.2)');
  });

  test('operational: threats, vulnerabilities, assumptions and mitigations only', async () => {
    const content = await convertToMarkdown(data, 'Full', 'operational');

    expect(content).toContain('## Threats');
    expect(content).toContain('## Mitigations');
    expect(content).toContain('## Assumptions');
    expect(content).toContain('## Vulnerability assessment (ZCR 5.2)');
    expect(content).not.toContain('## Riepilogo esecutivo');
    expect(content).not.toContain('## Analisi del rischio IEC 62443-3-2');
    expect(content).not.toContain('## Architecture');
    expect(content).not.toContain('IEC 62443-4-2');
  });

  test('full: all sections', async () => {
    const content = await convertToMarkdown(data, 'Full', 'full');

    expect(content).toContain('## Architecture');
    expect(content).toContain('## Threats');
    expect(content).toContain('## Analisi del rischio IEC 62443-3-2');
    expect(content).toContain('## Vulnerability assessment (ZCR 5.2)');
    expect(content).not.toContain('## Riepilogo esecutivo');
  });
});
