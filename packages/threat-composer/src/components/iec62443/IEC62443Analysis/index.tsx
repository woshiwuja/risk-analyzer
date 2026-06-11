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
import Badge from '@cloudscape-design/components/badge';
import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import FormField from '@cloudscape-design/components/form-field';
import Header from '@cloudscape-design/components/header';
import Select, { SelectProps } from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import Textarea from '@cloudscape-design/components/textarea';
import { FC, useCallback, useMemo } from 'react';
import { useIEC62443Context } from '../../../contexts/IEC62443Context/context';
import { useThreatsContext } from '../../../contexts/ThreatsContext/context';
import {
  IEC62443Finding,
  IEC62443RiskLevel,
  IEC62443ThreatAssessment,
  IEC62443_DAMAGE_LEVELS,
  IEC62443_LIKELIHOOD_LEVELS,
  IEC62443_PRIORITIES,
  IEC62443_RISK_LEVELS,
  IEC62443_STATUSES,
  IEC62443_STATUS_LABELS,
} from '../../../customTypes';
import { ZCR_DEFAULT_FINDINGS } from '../../../data/iec62443/zcrDefaultFindings';
import {
  IEC62443_RISK_MATRIX,
  computeBusinessDamage,
  computeRiskLevel,
  isRiskTolerable,
} from '../../../utils/iec62443Risk';
import standardizeNumericId from '../../../utils/standardizeNumericId';
import ContentLayout from '../../generic/ContentLayout';

const STATUS_OPTIONS = IEC62443_STATUSES.map(s => ({
  value: s,
  label: IEC62443_STATUS_LABELS[s],
}));

const PRIORITY_OPTIONS = IEC62443_PRIORITIES.map(p => ({
  value: p,
  label: p,
}));

// label compatta (solo il numero) per non allargare le celle; il nome esteso è nella tendina
const DAMAGE_OPTIONS: SelectProps.Option[] = IEC62443_DAMAGE_LEVELS.map((label, index) => ({
  value: `${index + 1}`,
  label: `${index + 1}`,
  description: label,
}));

const LIKELIHOOD_OPTIONS: SelectProps.Option[] = IEC62443_LIKELIHOOD_LEVELS.map((label, index) => ({
  value: `${index + 1}`,
  label: `${index + 1}`,
  description: label,
}));

const RISK_LEVEL_OPTIONS = IEC62443_RISK_LEVELS.map(level => ({
  value: level,
  label: level,
}));

const RISK_BADGE_COLOR: Record<IEC62443RiskLevel, 'green' | 'blue' | 'red' | 'grey'> = {
  Basso: 'green',
  Medio: 'blue',
  Alto: 'red',
  Critico: 'red',
};

const levelSelect = (
  options: SelectProps.Option[],
  value: number | undefined,
  onChange: (value: number | undefined) => void,
) => (<Select
  selectedOption={value ? options.find(o => o.value === `${value}`) || null : null}
  options={options}
  placeholder='—'
  expandToViewport
  onChange={({ detail }) => onChange(detail.selectedOption.value ? parseInt(detail.selectedOption.value, 10) : undefined)}
/>);

const RiskBadge: FC<{ level?: IEC62443RiskLevel }> = ({ level }) => (level ?
  <Badge color={RISK_BADGE_COLOR[level]}>{level}</Badge> :
  <Box color='text-status-inactive'>—</Box>);

const IEC62443AnalysisComponent: FC = () => {
  const { iec62443Analysis, setIEC62443Analysis } = useIEC62443Context();
  const { statementList } = useThreatsContext();

  const findings = useMemo<IEC62443Finding[]>(() => (iec62443Analysis.findings.length > 0 ?
    iec62443Analysis.findings :
    ZCR_DEFAULT_FINDINGS),
  [iec62443Analysis]);

  const threatAssessments = iec62443Analysis.threatAssessments || [];

  // -------------------- Business damage per minaccia --------------------

  const getAssessment = useCallback((threatId: string): IEC62443ThreatAssessment =>
    threatAssessments.find(a => a.threatId === threatId) || { threatId },
  [threatAssessments]);

  const handleUpdateAssessment = useCallback((threatId: string, update: Partial<IEC62443ThreatAssessment>) => {
    setIEC62443Analysis(prev => {
      const assessments = prev.threatAssessments || [];
      const existing = assessments.find(a => a.threatId === threatId);
      return {
        ...prev,
        threatAssessments: existing ?
          assessments.map(a => (a.threatId === threatId ? { ...a, ...update } : a)) :
          [...assessments, { threatId, ...update }],
      };
    });
  }, [setIEC62443Analysis]);

  // -------------------- Tollerabilità --------------------

  const handleUpdateTolerance = useCallback((update: Partial<Pick<typeof iec62443Analysis, 'toleranceLevel' | 'toleranceJustification'>>) => {
    setIEC62443Analysis(prev => ({ ...prev, ...update }));
  }, [setIEC62443Analysis]);

  // -------------------- Checklist ZCR --------------------

  const handleUpdateFinding = useCallback((id: string, update: Partial<IEC62443Finding>) => {
    setIEC62443Analysis(prev => ({
      ...prev,
      findings: findings.map(f => (f.id === id ? { ...f, ...update } : f)),
    }));
  }, [findings, setIEC62443Analysis]);

  const checklistSummary = useMemo(() => {
    const covered = findings.filter(f => f.status === 'covered').length;
    const partial = findings.filter(f => f.status === 'partial').length;
    const missing = findings.filter(f => f.status === 'missing').length;
    return `${findings.length} requisiti valutati: ${covered} coperti, ${partial} parziali, ${missing} mancanti`;
  }, [findings]);

  const riskMatrixItems = useMemo(() =>
    IEC62443_LIKELIHOOD_LEVELS.map((likelihoodLabel, likelihoodIndex) => ({
      likelihood: `${likelihoodIndex + 1} — ${likelihoodLabel}`,
      cells: IEC62443_RISK_MATRIX[likelihoodIndex],
    })), []);

  return (<ContentLayout title='Analisi del rischio IEC 62443-3-2'>
    <SpaceBetween direction='vertical' size='l'>

      {/* -------------------- Tollerabilità del rischio -------------------- */}
      <Container header={<Header
        description='Definizione della soglia di rischio tollerabile e della matrice di rischio (ZCR 4, ZCR 5.5, ZCR 6.8)'
      >Tollerabilità del rischio</Header>}>
        <ColumnLayout columns={2}>
          <SpaceBetween direction='vertical' size='m'>
            <FormField
              label='Livello massimo di rischio tollerabile'
              description='I rischi calcolati oltre questa soglia non sono tollerabili e richiedono mitigazione'
            >
              <Select
                selectedOption={RISK_LEVEL_OPTIONS.find(o => o.value === iec62443Analysis.toleranceLevel) || null}
                options={RISK_LEVEL_OPTIONS}
                placeholder='Seleziona la soglia'
                onChange={({ detail }) =>
                  handleUpdateTolerance({ toleranceLevel: detail.selectedOption.value as IEC62443RiskLevel })}
              />
            </FormField>
            <FormField
              label='Criterio e giustificazione'
              description='Spiega come è stata determinata la soglia (policy aziendale, requisiti di legge, asset owner)'
              stretch
            >
              <Textarea
                value={iec62443Analysis.toleranceJustification || ''}
                rows={5}
                onChange={({ detail }) => handleUpdateTolerance({ toleranceJustification: detail.value })}
              />
            </FormField>
          </SpaceBetween>
          <SpaceBetween direction='vertical' size='xs'>
            <Table
              header={<Header variant='h3'>Matrice di rischio (probabilità × danno)</Header>}
              columnDefinitions={[
                {
                  id: 'likelihood',
                  header: 'Prob. \\ Danno',
                  cell: (item: typeof riskMatrixItems[number]) => <Box fontWeight='bold'>{item.likelihood}</Box>,
                },
                ...IEC62443_DAMAGE_LEVELS.map((_damageLabel, damageIndex) => ({
                  id: `damage-${damageIndex}`,
                  header: `${damageIndex + 1}`,
                  cell: (item: typeof riskMatrixItems[number]) => <RiskBadge level={item.cells[damageIndex]} />,
                })),
              ]}
              items={riskMatrixItems}
              variant='embedded'
            />
            <Box variant='small'>
              Danno: 1 Trascurabile · 2 Marginale · 3 Critico · 4 Catastrofico
            </Box>
          </SpaceBetween>
        </ColumnLayout>
      </Container>

      {/* -------------------- Business damage per minaccia -------------------- */}
      <Table
        header={<Header
          counter={`(${statementList.length})`}
          description='Danno worst-case per dimensione (HSE, produzione, finanziaria), probabilità non mitigata e rischio risultante (ZCR 2, ZCR 5.3–5.5, 5.7). Scale 1–4 — danno: 1 Trascurabile, 2 Marginale, 3 Critico, 4 Catastrofico; probabilità: 1 Improbabile, 2 Possibile, 3 Probabile, 4 Frequente.'
        >Business damage e rischio per minaccia</Header>}
        columnDefinitions={[
          {
            id: 'threat',
            header: 'Minaccia',
            cell: (item) => {
              const threatId = `T-${standardizeNumericId(item.numericId)}`;
              return (<Box>
                <Box fontWeight='bold'>{threatId}</Box>
                <Box variant='small'>{item.statement}</Box>
              </Box>);
            },
            minWidth: 220,
          },
          {
            id: 'hse',
            header: 'HSE',
            cell: (item) => levelSelect(DAMAGE_OPTIONS, getAssessment(item.id).hse,
              v => handleUpdateAssessment(item.id, { hse: v })),
            width: 90,
          },
          {
            id: 'production',
            header: 'Prod.',
            cell: (item) => levelSelect(DAMAGE_OPTIONS, getAssessment(item.id).production,
              v => handleUpdateAssessment(item.id, { production: v })),
            width: 90,
          },
          {
            id: 'financial',
            header: 'Fin.',
            cell: (item) => levelSelect(DAMAGE_OPTIONS, getAssessment(item.id).financial,
              v => handleUpdateAssessment(item.id, { financial: v })),
            width: 90,
          },
          {
            id: 'likelihood',
            header: 'Prob.',
            cell: (item) => levelSelect(LIKELIHOOD_OPTIONS, getAssessment(item.id).likelihood,
              v => handleUpdateAssessment(item.id, { likelihood: v })),
            width: 90,
          },
          {
            id: 'damage',
            header: 'Danno',
            cell: (item) => {
              const damage = computeBusinessDamage(getAssessment(item.id));
              return damage ?
                <Badge color='grey'>{`${damage}`}</Badge> :
                <Box color='text-status-inactive'>—</Box>;
            },
            width: 80,
          },
          {
            id: 'risk',
            header: 'Rischio',
            cell: (item) => {
              const assessment = getAssessment(item.id);
              return <RiskBadge level={computeRiskLevel(computeBusinessDamage(assessment), assessment.likelihood)} />;
            },
            width: 95,
          },
          {
            id: 'tolerable',
            header: 'Toll.',
            cell: (item) => {
              const assessment = getAssessment(item.id);
              const tolerable = isRiskTolerable(
                computeRiskLevel(computeBusinessDamage(assessment), assessment.likelihood),
                iec62443Analysis.toleranceLevel,
              );
              return tolerable === undefined ?
                <Box color='text-status-inactive'>—</Box> :
                <Badge color={tolerable ? 'green' : 'red'}>{tolerable ? 'Sì' : 'No'}</Badge>;
            },
            width: 80,
          },
          {
            id: 'notes',
            header: 'Spiegazione',
            cell: (item) => (<Textarea
              value={getAssessment(item.id).notes || ''}
              rows={2}
              placeholder='Motivazione della valutazione, contromisure implementate…'
              onChange={({ detail }) => handleUpdateAssessment(item.id, { notes: detail.value })}
            />),
            minWidth: 200,
          },
        ]}
        items={statementList}
        trackBy='id'
        wrapLines
        variant='container'
        empty={<Box textAlign='center' color='text-status-inactive' padding='m'>
          Nessuna minaccia nel workspace. Aggiungi le minacce dalla sezione Threats.
        </Box>}
      />

      {/* -------------------- Checklist ZCR -------------------- */}
      <SpaceBetween direction='vertical' size='s'>
        <Table
          header={<Header
            counter={`(${findings.length})`}
            description={checklistSummary}
          >Checklist requisiti ZCR</Header>}
          columnDefinitions={[
            {
              id: 'requirement',
              header: 'Requisito norma',
              cell: (item: IEC62443Finding) => <Box fontWeight='bold'>{item.requirement}</Box>,
              width: 210,
            },
            {
              id: 'status',
              header: 'Stato',
              cell: (item: IEC62443Finding) => (<Select
                selectedOption={STATUS_OPTIONS.find(o => o.value === item.status) || null}
                options={STATUS_OPTIONS}
                expandToViewport
                onChange={({ detail }) =>
                  handleUpdateFinding(item.id, { status: detail.selectedOption.value as IEC62443Finding['status'] })}
              />),
              width: 150,
            },
            {
              id: 'detail',
              header: 'Cosa manca / Evidenza',
              cell: (item: IEC62443Finding) => (<Textarea
                value={item.detail}
                rows={2}
                onChange={({ detail }) => handleUpdateFinding(item.id, { detail: detail.value })}
              />),
            },
            {
              id: 'implementation',
              header: 'Spiegazione implementazione',
              cell: (item: IEC62443Finding) => (<Textarea
                value={item.implementation || ''}
                rows={2}
                placeholder='Come è (o sarà) implementato il requisito…'
                onChange={({ detail }) => handleUpdateFinding(item.id, { implementation: detail.value })}
              />),
            },
            {
              id: 'priority',
              header: 'Priorità',
              cell: (item: IEC62443Finding) => (<Select
                selectedOption={PRIORITY_OPTIONS.find(o => o.value === item.priority) || null}
                options={PRIORITY_OPTIONS}
                onChange={({ detail }) =>
                  handleUpdateFinding(item.id, { priority: detail.selectedOption.value as IEC62443Finding['priority'] })}
              />),
              width: 115,
            },
          ]}
          items={findings}
          trackBy='id'
          wrapLines
          variant='container'
        />
      </SpaceBetween>
    </SpaceBetween>
  </ContentLayout>);
};

export default IEC62443AnalysisComponent;
