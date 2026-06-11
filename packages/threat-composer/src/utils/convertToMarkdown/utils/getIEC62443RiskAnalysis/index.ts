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
  IEC62443Finding,
  IEC62443_DAMAGE_LEVELS,
  IEC62443_LIKELIHOOD_LEVELS,
  IEC62443_PRIORITIES,
} from '../../../../customTypes';
import { ZCR_DEFAULT_FINDINGS } from '../../../../data/iec62443/zcrDefaultFindings';
import escapeMarkdown from '../../../../utils/escapeMarkdown';
import {
  IEC62443_RISK_MATRIX,
  computeBusinessDamage,
  computeRiskLevel,
  isRiskTolerable,
} from '../../../../utils/iec62443Risk';
import standardizeNumericId from '../../../../utils/standardizeNumericId';

const sortByPriority = (findings: IEC62443Finding[]) =>
  [...findings].sort((a, b) => IEC62443_PRIORITIES.indexOf(a.priority) - IEC62443_PRIORITIES.indexOf(b.priority));

const damageLabel = (value?: number) => (value ? `${value} — ${IEC62443_DAMAGE_LEVELS[value - 1]}` : '—');
const likelihoodLabel = (value?: number) => (value ? `${value} — ${IEC62443_LIKELIHOOD_LEVELS[value - 1]}` : '—');

const cell = (value?: string) => escapeMarkdown(value || '').replace(/\|/g, '\\|').replace(/\n/g, '<br/>');

export const getIEC62443RiskAnalysisContent = async (
  data: DataExchangeFormat,
) => {
  const analysis = data.iec62443Analysis;
  const findings = analysis?.findings?.length ? analysis.findings : ZCR_DEFAULT_FINDINGS;

  const covered = findings.filter(f => f.status === 'covered');
  const partial = sortByPriority(findings.filter(f => f.status === 'partial'));
  const missing = sortByPriority(findings.filter(f => f.status === 'missing'));
  const hasImplementation = findings.some(f => !!f.implementation);

  const rows: string[] = [];

  rows.push('## Analisi del rischio IEC 62443-3-2');
  rows.push('\n');
  rows.push('Questa sezione documenta la valutazione del rischio secondo IEC 62443-3-2 ' +
    '*Security risk assessment for system design* (requisiti ZCR — Zone and Conduit Requirements).');
  rows.push('\n');

  // -------------------- Zone e condotti --------------------
  const zonesConduits = analysis?.zonesConduits || [];
  if (zonesConduits.length > 0) {
    rows.push('### Zone e condotti (ZCR 3, ZCR 5.6)');
    rows.push('\n');
    rows.push('| Nome | Tipo | Descrizione / Asset inclusi | SL-T | Note |');
    rows.push('| --- | --- | --- | --- | --- |');
    rows.push(...zonesConduits.map(z =>
      `| ${cell(z.name)} | ${z.type} | ${cell(z.description)} | ${z.slT} | ${cell(z.notes)} |`));
    rows.push('\n');
  }

  // -------------------- Tollerabilità del rischio --------------------
  if (analysis?.toleranceLevel || analysis?.toleranceJustification) {
    rows.push('### Tollerabilità del rischio (ZCR 4, ZCR 6.8)');
    rows.push('\n');
    if (analysis.toleranceLevel) {
      rows.push(`Livello massimo di rischio tollerabile: **${analysis.toleranceLevel}**. I rischi oltre questa soglia non sono tollerabili e richiedono mitigazione.`);
      rows.push('\n');
    }
    if (analysis.toleranceJustification) {
      rows.push(`Criterio e giustificazione: ${escapeMarkdown(analysis.toleranceJustification)}`);
      rows.push('\n');
    }
    rows.push('Matrice di rischio (probabilità × danno):');
    rows.push('\n');
    rows.push(`| Probabilità \\ Danno | ${IEC62443_DAMAGE_LEVELS.map((d, i) => `${i + 1} — ${d}`).join(' | ')} |`);
    rows.push(`| --- | ${IEC62443_DAMAGE_LEVELS.map(() => '---').join(' | ')} |`);
    rows.push(...IEC62443_LIKELIHOOD_LEVELS.map((l, likelihoodIndex) =>
      `| **${likelihoodIndex + 1} — ${l}** | ${IEC62443_RISK_MATRIX[likelihoodIndex].join(' | ')} |`));
    rows.push('\n');
  }

  // -------------------- Business damage per minaccia --------------------
  const threatAssessments = (analysis?.threatAssessments || []).filter(a =>
    a.hse || a.production || a.financial || a.likelihood || a.notes);
  if (threatAssessments.length > 0) {
    rows.push('### Business damage e rischio per minaccia (ZCR 2, ZCR 5.3–5.5, 5.7)');
    rows.push('\n');
    rows.push('Il business damage è il massimo tra le dimensioni HSE, produzione e finanziaria. Il rischio è calcolato con la matrice probabilità × danno.');
    rows.push('\n');
    rows.push('| Minaccia | Danno HSE | Danno produzione | Danno finanziario | Business damage | Probabilità | Rischio | Tollerabile | Spiegazione / Implementazione |');
    rows.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
    rows.push(...threatAssessments.map(assessment => {
      const threat = data.threats?.find(t => t.id === assessment.threatId);
      const threatLabel = threat ?
        `**T-${standardizeNumericId(threat.numericId)}**: ${cell(threat.statement)}` :
        assessment.threatId;
      const damage = computeBusinessDamage(assessment);
      const risk = computeRiskLevel(damage, assessment.likelihood);
      const tolerable = isRiskTolerable(risk, analysis?.toleranceLevel);
      return `| ${threatLabel} | ${damageLabel(assessment.hse)} | ${damageLabel(assessment.production)} | ` +
        `${damageLabel(assessment.financial)} | ${damageLabel(damage)} | ${likelihoodLabel(assessment.likelihood)} | ` +
        `${risk || '—'} | ${tolerable === undefined ? '—' : tolerable ? 'Sì' : '**No**'} | ${cell(assessment.notes)} |`;
    }));
    rows.push('\n');
  }

  // -------------------- Checklist ZCR --------------------
  const implementationHeader = hasImplementation ? ' Spiegazione implementazione |' : '';
  const implementationSeparator = hasImplementation ? ' --- |' : '';
  const implementationCell = (f: IEC62443Finding) => (hasImplementation ? ` ${cell(f.implementation)} |` : '');

  rows.push('### Coperto');
  rows.push('\n');
  if (covered.length > 0) {
    rows.push(`| Requisito norma | Evidenza |${implementationHeader}`);
    rows.push(`| --- | --- |${implementationSeparator}`);
    rows.push(...covered.map(f => `| ${f.requirement} | ${cell(f.detail)} |${implementationCell(f)}`));
  } else {
    rows.push('_Nessun requisito completamente coperto._');
  }
  rows.push('\n');

  rows.push('### Parziale');
  rows.push('\n');
  if (partial.length > 0) {
    rows.push(`| Requisito norma | Cosa manca | Priorità |${implementationHeader}`);
    rows.push(`| --- | --- | --- |${implementationSeparator}`);
    rows.push(...partial.map(f => `| ${f.requirement} | ${cell(f.detail)} | ${f.priority} |${implementationCell(f)}`));
  } else {
    rows.push('_Nessun requisito parzialmente coperto._');
  }
  rows.push('\n');

  rows.push('### Mancante (gap rispetto alla norma)');
  rows.push('\n');
  if (missing.length > 0) {
    rows.push(`| Requisito norma | Cosa manca | Priorità |${implementationHeader}`);
    rows.push(`| --- | --- | --- |${implementationSeparator}`);
    rows.push(...missing.map(f => `| ${f.requirement} | ${cell(f.detail)} | ${f.priority} |${implementationCell(f)}`));
  } else {
    rows.push('_Nessun gap rilevato._');
  }
  rows.push('\n');

  rows.push('### Riepilogo');
  rows.push('\n');
  rows.push(`${findings.length} requisiti valutati: ${covered.length} coperti, ${partial.length} parziali, ${missing.length} mancanti.`);
  rows.push('\n');

  return rows.join('\n');
};
