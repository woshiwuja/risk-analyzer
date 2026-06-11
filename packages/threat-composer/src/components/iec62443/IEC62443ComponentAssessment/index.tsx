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
import Container from '@cloudscape-design/components/container';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import FormField from '@cloudscape-design/components/form-field';
import Header from '@cloudscape-design/components/header';
import Input from '@cloudscape-design/components/input';
import Select, { SelectProps } from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import Textarea from '@cloudscape-design/components/textarea';
import Toggle from '@cloudscape-design/components/toggle';
import { FC, useCallback, useMemo, useState } from 'react';
import { useIEC62443Context } from '../../../contexts/IEC62443Context/context';
import {
  IEC62443ComponentAssessmentItem,
  IEC62443_4_2_STATUSES,
  IEC62443_4_2_STATUS_LABELS,
} from '../../../customTypes';
import {
  IEC62443_4_2Requirement,
  IEC62443_4_2_REQUIREMENTS,
  IEC62443_4_2_SECTIONS,
  isRequirementInSlTarget,
} from '../../../data/iec62443/requirements4_2';
import ContentLayout from '../../generic/ContentLayout';

const STATUS_SHORT_LABELS: Record<typeof IEC62443_4_2_STATUSES[number], string> = {
  satisfied: 'a. Soddisfatto',
  satisfiedIntegration: 'b. Integrazione sistema',
  notSatisfied: 'Non soddisfatto',
  notRelevant: 'c. Non pertinente',
  notApplicable: 'Non applicabile',
};

const STATUS_OPTIONS: SelectProps.Option[] = IEC62443_4_2_STATUSES.map(s => ({
  value: s,
  label: STATUS_SHORT_LABELS[s],
  description: IEC62443_4_2_STATUS_LABELS[s],
}));

const SL_TARGET_OPTIONS: SelectProps.Option[] = [1, 2, 3, 4].map(sl => ({
  value: `${sl}`,
  label: `SL ${sl}`,
}));

const COMPONENT_LABELS: [keyof IEC62443_4_2Requirement['components'], string][] = [
  ['softwareApplication', 'SW'],
  ['embeddedDevice', 'ED'],
  ['hostDevice', 'HD'],
  ['networkDevice', 'ND'],
];

const IEC62443ComponentAssessmentComponent: FC = () => {
  const { iec62443Analysis, setIEC62443Analysis } = useIEC62443Context();
  const [hideOutOfTarget, setHideOutOfTarget] = useState(false);

  const assessment = iec62443Analysis.componentAssessment;
  const slTarget = assessment?.slTarget;
  const items = useMemo(() => assessment?.items || [], [assessment]);

  const getItem = useCallback((requirementId: string): IEC62443ComponentAssessmentItem =>
    items.find(i => i.requirementId === requirementId) || { requirementId },
  [items]);

  const handleUpdateItem = useCallback((requirementId: string, update: Partial<IEC62443ComponentAssessmentItem>) => {
    setIEC62443Analysis(prev => {
      const prevItems = prev.componentAssessment?.items || [];
      const existing = prevItems.find(i => i.requirementId === requirementId);
      return {
        ...prev,
        componentAssessment: {
          ...(prev.componentAssessment || { items: [] }),
          items: existing ?
            prevItems.map(i => (i.requirementId === requirementId ? { ...i, ...update } : i)) :
            [...prevItems, { requirementId, ...update }],
        },
      };
    });
  }, [setIEC62443Analysis]);

  const handleUpdateAssessment = useCallback((update: { slTarget?: number; componentName?: string }) => {
    setIEC62443Analysis(prev => ({
      ...prev,
      componentAssessment: {
        ...(prev.componentAssessment || { items: [] }),
        ...update,
      },
    }));
  }, [setIEC62443Analysis]);

  const summary = useMemo(() => {
    const inTarget = IEC62443_4_2_REQUIREMENTS.filter(r => isRequirementInSlTarget(r, slTarget));
    const counts = { satisfied: 0, satisfiedIntegration: 0, notSatisfied: 0, notRelevant: 0, notApplicable: 0 };
    let unassessed = 0;
    inTarget.forEach(r => {
      const status = getItem(r.id).status;
      if (status) {
        counts[status] += 1;
      } else {
        unassessed += 1;
      }
    });
    return `${inTarget.length} requisiti richiesti${slTarget ? ` a SL-T ${slTarget}` : ''}: ` +
      `${counts.satisfied + counts.satisfiedIntegration} soddisfatti, ${counts.notSatisfied} non soddisfatti, ` +
      `${counts.notRelevant + counts.notApplicable} non pertinenti/applicabili, ${unassessed} da valutare`;
  }, [slTarget, getItem]);

  const renderSection = (sectionId: string, title: string) => {
    const sectionRequirements = IEC62443_4_2_REQUIREMENTS
      .filter(r => r.section === sectionId)
      .filter(r => !hideOutOfTarget || isRequirementInSlTarget(r, slTarget));

    if (sectionRequirements.length === 0) {
      return null;
    }

    return (<ExpandableSection key={sectionId} headerText={`${title} (${sectionRequirements.length})`} variant='container'>
      <Table
        columnDefinitions={[
          {
            id: 'id',
            header: 'ID',
            cell: (item: IEC62443_4_2Requirement) => <Box fontWeight='bold'>{item.id}</Box>,
            width: 130,
          },
          {
            id: 'requirement',
            header: 'Requisito',
            cell: (item: IEC62443_4_2Requirement) => (<Box>
              <Box fontWeight='bold'>{item.name}</Box>
              <Box variant='small'>{item.description}</Box>
              {item.validation && <Box variant='small' color='text-body-secondary'>Validazione: {item.validation}</Box>}
            </Box>),
            minWidth: 280,
          },
          {
            id: 'csl',
            header: 'CSL',
            cell: (item: IEC62443_4_2Requirement) => (
              isRequirementInSlTarget(item, slTarget) ?
                <Box>{item.csl.join(', ') || '—'}</Box> :
                <Badge color='grey'>oltre SL-T</Badge>
            ),
            width: 95,
          },
          {
            id: 'components',
            header: 'Applic.',
            cell: (item: IEC62443_4_2Requirement) => (
              <Box variant='small'>
                {COMPONENT_LABELS.filter(([key]) => item.components[key]).map(([, label]) => label).join(' · ') || '—'}
              </Box>
            ),
            width: 110,
          },
          {
            id: 'status',
            header: 'Stato',
            cell: (item: IEC62443_4_2Requirement) => (<Select
              selectedOption={STATUS_OPTIONS.find(o => o.value === getItem(item.id).status) || null}
              options={STATUS_OPTIONS}
              placeholder='Da valutare'
              expandToViewport
              onChange={({ detail }) =>
                handleUpdateItem(item.id, { status: detail.selectedOption.value as IEC62443ComponentAssessmentItem['status'] })}
            />),
            width: 210,
          },
          {
            id: 'notes',
            header: 'Note / Spiegazione implementazione',
            cell: (item: IEC62443_4_2Requirement) => (<Textarea
              value={getItem(item.id).notes || ''}
              rows={2}
              placeholder='Come è soddisfatto il requisito, misure compensative…'
              onChange={({ detail }) => handleUpdateItem(item.id, { notes: detail.value })}
            />),
            minWidth: 220,
          },
          {
            id: 'effort',
            header: 'Stima carico',
            cell: (item: IEC62443_4_2Requirement) => (<Input
              value={getItem(item.id).effort || ''}
              placeholder='es. 5 gg'
              onChange={({ detail }) => handleUpdateItem(item.id, { effort: detail.value })}
            />),
            width: 130,
          },
        ]}
        items={sectionRequirements}
        trackBy='id'
        wrapLines
        variant='embedded'
      />
    </ExpandableSection>);
  };

  return (<ContentLayout title='IEC 62443-4-2 — Requisiti componente (FSA)'>
    <SpaceBetween direction='vertical' size='l'>
      <Container header={<Header description={summary}>Componente in valutazione</Header>}>
        <SpaceBetween direction='horizontal' size='l'>
          <FormField label='Nome componente'>
            <Input
              value={assessment?.componentName || ''}
              placeholder='es. Gateway Digilink'
              onChange={({ detail }) => handleUpdateAssessment({ componentName: detail.value })}
            />
          </FormField>
          <FormField label='Security Level Target (SL-T)'>
            <Select
              selectedOption={SL_TARGET_OPTIONS.find(o => o.value === `${slTarget}`) || null}
              options={SL_TARGET_OPTIONS}
              placeholder='Seleziona SL-T'
              onChange={({ detail }) =>
                handleUpdateAssessment({ slTarget: parseInt(detail.selectedOption.value!, 10) })}
            />
          </FormField>
          <FormField label='Filtro'>
            <Toggle
              checked={hideOutOfTarget}
              onChange={({ detail }) => setHideOutOfTarget(detail.checked)}
            >Nascondi requisiti oltre SL-T</Toggle>
          </FormField>
        </SpaceBetween>
      </Container>
      {IEC62443_4_2_SECTIONS.map(s => renderSection(s.id, s.title))}
    </SpaceBetween>
  </ContentLayout>);
};

export default IEC62443ComponentAssessmentComponent;
