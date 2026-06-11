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
  DataExchangeFormat,
  IEC62443_4_2_STATUS_LABELS,
} from '../../../../customTypes';
import {
  IEC62443_4_2_REQUIREMENTS,
  IEC62443_4_2_SECTIONS,
  isRequirementInSlTarget,
} from '../../../../data/iec62443/requirements4_2';
import escapeMarkdown from '../../../../utils/escapeMarkdown';

const cell = (value?: string) => escapeMarkdown(value || '').replace(/\|/g, '\\|').replace(/\n/g, '<br/>');

export const getIEC62443ComponentAssessmentContent = async (
  data: DataExchangeFormat,
) => {
  const assessment = data.iec62443Analysis?.componentAssessment;

  if (!assessment || (assessment.items.length === 0 && !assessment.slTarget && !assessment.componentName)) {
    return '';
  }

  const slTarget = assessment.slTarget;
  const getItem = (requirementId: string) => assessment.items.find(i => i.requirementId === requirementId);

  const rows: string[] = [];

  rows.push('## Valutazione requisiti componente IEC 62443-4-2');
  rows.push('\n');
  rows.push('Questa sezione documenta la valutazione di conformità (FSA — Functional Security Assessment) ' +
    'del componente rispetto ai requisiti tecnici di IEC 62443-4-2.' +
    (assessment.componentName ? ` Componente in valutazione: **${escapeMarkdown(assessment.componentName)}**.` : '') +
    (slTarget ? ` Security Level Target: **SL ${slTarget}**.` : ''));
  rows.push('\n');

  // Riepilogo
  const inTarget = IEC62443_4_2_REQUIREMENTS.filter(r => isRequirementInSlTarget(r, slTarget));
  const counts = { satisfied: 0, satisfiedIntegration: 0, notSatisfied: 0, notRelevant: 0, notApplicable: 0 };
  let unassessed = 0;
  inTarget.forEach(r => {
    const status = getItem(r.id)?.status;
    if (status) {
      counts[status] += 1;
    } else {
      unassessed += 1;
    }
  });
  rows.push(`${inTarget.length} requisiti richiesti${slTarget ? ` a SL-T ${slTarget}` : ''}: ` +
    `${counts.satisfied + counts.satisfiedIntegration} soddisfatti, ${counts.notSatisfied} non soddisfatti, ` +
    `${counts.notRelevant + counts.notApplicable} non pertinenti/applicabili, ${unassessed} da valutare.`);
  rows.push('\n');

  IEC62443_4_2_SECTIONS.forEach(section => {
    const sectionRequirements = IEC62443_4_2_REQUIREMENTS.filter(r => r.section === section.id);
    if (sectionRequirements.length === 0) {
      return;
    }

    rows.push(`### ${section.title}`);
    rows.push('\n');
    rows.push('| ID | Requisito | CSL | Stato | Note | Stima carico |');
    rows.push('| --- | --- | --- | --- | --- | --- |');
    rows.push(...sectionRequirements.map(r => {
      const item = getItem(r.id);
      const outOfTarget = !isRequirementInSlTarget(r, slTarget);
      const status = item?.status ?
        IEC62443_4_2_STATUS_LABELS[item.status] :
        (outOfTarget ? `Non richiesto a SL-T ${slTarget}` : 'Da valutare');
      return `| ${cell(r.id)} | **${cell(r.name)}**<br/>${cell(r.description)} | ${r.csl.join(', ') || '—'} | ` +
        `${cell(status)} | ${cell(item?.notes)} | ${cell(item?.effort)} |`;
    }));
    rows.push('\n');
  });

  return rows.join('\n');
};
