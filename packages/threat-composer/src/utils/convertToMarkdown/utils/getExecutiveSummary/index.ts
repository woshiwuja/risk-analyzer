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
import { DataExchangeFormat, VA_SEVERITY_LABELS } from '../../../../customTypes';
import {
  IEC62443_4_2_REQUIREMENTS,
  isRequirementInSlTarget,
} from '../../../../data/iec62443/requirements4_2';
import { ZCR_DEFAULT_FINDINGS } from '../../../../data/iec62443/zcrDefaultFindings';
import mitigationStatus from '../../../../data/status/mitigationStatus.json';

const NOT_SET = 'Non assegnata';

export const getExecutiveSummaryContent = async (
  data: DataExchangeFormat,
) => {
  const rows: string[] = [];

  rows.push('## Riepilogo esecutivo');
  rows.push('\n');

  // -------------------- Minacce per priorità --------------------
  const threats = data.threats || [];
  const priorityCounts = new Map<string, number>();
  threats.forEach(t => {
    const priority = (t.metadata?.find(m => m.key === 'Priority')?.value as string) || NOT_SET;
    priorityCounts.set(priority, (priorityCounts.get(priority) || 0) + 1);
  });

  rows.push('### Minacce per priorità');
  rows.push('\n');
  rows.push('| Priorità | Numero |');
  rows.push('| --- | --- |');
  ['High', 'Medium', 'Low', NOT_SET].forEach(priority => {
    rows.push(`| ${priority} | ${priorityCounts.get(priority) || 0} |`);
  });
  rows.push(`| **Totale** | **${threats.length}** |`);
  rows.push('\n');

  // -------------------- Stato delle mitigazioni --------------------
  const mitigations = data.mitigations || [];
  const statusCounts = new Map<string, number>();
  mitigations.forEach(m => {
    const label = (m.status && mitigationStatus.find(ms => ms.value === m.status)?.label) || NOT_SET;
    statusCounts.set(label, (statusCounts.get(label) || 0) + 1);
  });

  rows.push('### Stato delle mitigazioni');
  rows.push('\n');
  rows.push('| Stato | Numero |');
  rows.push('| --- | --- |');
  [...mitigationStatus.map(ms => ms.label), NOT_SET].forEach(label => {
    rows.push(`| ${label} | ${statusCounts.get(label) || 0} |`);
  });
  rows.push(`| **Totale** | **${mitigations.length}** |`);
  rows.push('\n');

  // -------------------- Vulnerabilità per severità --------------------
  const vulnerabilities = data.iec62443Analysis?.vulnerabilityAssessment?.vulnerabilities || [];
  if (vulnerabilities.length > 0) {
    const severityCounts = [0, 0, 0, 0, 0];
    vulnerabilities.forEach(v => {
      severityCounts[v.severity] += 1;
    });

    rows.push('### Vulnerabilità per severità');
    rows.push('\n');
    rows.push('| Severità | Numero |');
    rows.push('| --- | --- |');
    [4, 3, 2, 1, 0].forEach(severity => {
      rows.push(`| ${VA_SEVERITY_LABELS[severity]} | ${severityCounts[severity]} |`);
    });
    rows.push(`| **Totale** | **${vulnerabilities.length}** |`);
    rows.push('\n');
  }

  // -------------------- Conformità IEC 62443-3-2 --------------------
  const findings = data.iec62443Analysis?.findings?.length ? data.iec62443Analysis.findings : ZCR_DEFAULT_FINDINGS;
  const covered = findings.filter(f => f.status === 'covered').length;
  const partial = findings.filter(f => f.status === 'partial').length;
  const missing = findings.filter(f => f.status === 'missing').length;

  rows.push('### Conformità IEC 62443-3-2 (requisiti ZCR)');
  rows.push('\n');
  rows.push(`${findings.length} requisiti valutati: **${covered} coperti**, **${partial} parziali**, **${missing} mancanti**.`);
  rows.push('\n');

  // -------------------- Conformità IEC 62443-4-2 --------------------
  const componentAssessment = data.iec62443Analysis?.componentAssessment;
  if (componentAssessment && (componentAssessment.items.length > 0 || componentAssessment.slTarget || componentAssessment.componentName)) {
    const slTarget = componentAssessment.slTarget;
    const inTarget = IEC62443_4_2_REQUIREMENTS.filter(r => isRequirementInSlTarget(r, slTarget));
    let satisfied = 0;
    let notSatisfied = 0;
    let notApplicable = 0;
    let unassessed = 0;
    inTarget.forEach(r => {
      const status = componentAssessment.items.find(i => i.requirementId === r.id)?.status;
      if (status === 'satisfied' || status === 'satisfiedIntegration') {
        satisfied += 1;
      } else if (status === 'notSatisfied') {
        notSatisfied += 1;
      } else if (status === 'notRelevant' || status === 'notApplicable') {
        notApplicable += 1;
      } else {
        unassessed += 1;
      }
    });

    rows.push('### Conformità IEC 62443-4-2 (requisiti componente)');
    rows.push('\n');
    rows.push((componentAssessment.componentName ? `Componente: **${componentAssessment.componentName}**. ` : '') +
      (slTarget ? `Security Level Target: **SL ${slTarget}**. ` : '') +
      `${inTarget.length} requisiti richiesti: **${satisfied} soddisfatti**, **${notSatisfied} non soddisfatti**, ` +
      `${notApplicable} non pertinenti/applicabili, ${unassessed} da valutare.`);
    rows.push('\n');
  }

  return rows.join('\n');
};
