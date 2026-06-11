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
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Header from '@cloudscape-design/components/header';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import Textarea from '@cloudscape-design/components/textarea';
import { FC, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useIEC62443Context } from '../../../contexts/IEC62443Context/context';
import {
  IEC62443ZoneConduit,
  IEC62443_SECURITY_LEVELS,
} from '../../../customTypes';

const SL_OPTIONS = IEC62443_SECURITY_LEVELS.map(sl => ({
  value: sl,
  label: sl,
}));

const ZONE_TYPE_OPTIONS = [
  { value: 'Zona', label: 'Zona' },
  { value: 'Condotto', label: 'Condotto' },
];

const ZonesConduits: FC = () => {
  const { iec62443Analysis, setIEC62443Analysis } = useIEC62443Context();

  const zonesConduits = iec62443Analysis.zonesConduits || [];

  const handleAddZoneConduit = useCallback((type: IEC62443ZoneConduit['type']) => {
    setIEC62443Analysis(prev => ({
      ...prev,
      zonesConduits: [...(prev.zonesConduits || []), {
        id: uuidv4(),
        name: '',
        type,
        description: '',
        slT: 'SL 1',
        notes: '',
      }],
    }));
  }, [setIEC62443Analysis]);

  const handleUpdateZoneConduit = useCallback((id: string, update: Partial<IEC62443ZoneConduit>) => {
    setIEC62443Analysis(prev => ({
      ...prev,
      zonesConduits: (prev.zonesConduits || []).map(z => (z.id === id ? { ...z, ...update } : z)),
    }));
  }, [setIEC62443Analysis]);

  const handleRemoveZoneConduit = useCallback((id: string) => {
    setIEC62443Analysis(prev => ({
      ...prev,
      zonesConduits: (prev.zonesConduits || []).filter(z => z.id !== id),
    }));
  }, [setIEC62443Analysis]);

  return (<Table
    header={<Header
      counter={`(${zonesConduits.length})`}
      description='Partizionamento del SUC in zone e condotti con relativo Security Level Target (ZCR 3, ZCR 5.6, ZCR 6.4)'
      actions={<SpaceBetween direction='horizontal' size='xs'>
        <Button onClick={() => handleAddZoneConduit('Zona')}>Aggiungi zona</Button>
        <Button onClick={() => handleAddZoneConduit('Condotto')}>Aggiungi condotto</Button>
      </SpaceBetween>}
    >Zone e condotti</Header>}
    columnDefinitions={[
      {
        id: 'name',
        header: 'Nome',
        cell: (item: IEC62443ZoneConduit) => (<Input
          value={item.name}
          placeholder='es. Zona di controllo'
          onChange={({ detail }) => handleUpdateZoneConduit(item.id, { name: detail.value })}
        />),
        width: 180,
      },
      {
        id: 'type',
        header: 'Tipo',
        cell: (item: IEC62443ZoneConduit) => (<Select
          selectedOption={ZONE_TYPE_OPTIONS.find(o => o.value === item.type) || null}
          options={ZONE_TYPE_OPTIONS}
          expandToViewport
          onChange={({ detail }) =>
            handleUpdateZoneConduit(item.id, { type: detail.selectedOption.value as IEC62443ZoneConduit['type'] })}
        />),
        width: 125,
      },
      {
        id: 'description',
        header: 'Descrizione / Asset inclusi / Zone collegate',
        cell: (item: IEC62443ZoneConduit) => (<Textarea
          value={item.description}
          rows={2}
          onChange={({ detail }) => handleUpdateZoneConduit(item.id, { description: detail.value })}
        />),
      },
      {
        id: 'slT',
        header: 'SL-T',
        cell: (item: IEC62443ZoneConduit) => (<Select
          selectedOption={SL_OPTIONS.find(o => o.value === item.slT) || null}
          options={SL_OPTIONS}
          expandToViewport
          onChange={({ detail }) =>
            handleUpdateZoneConduit(item.id, { slT: detail.selectedOption.value as IEC62443ZoneConduit['slT'] })}
        />),
        width: 100,
      },
      {
        id: 'notes',
        header: 'Note (safety, wireless, dispositivi temporanei)',
        cell: (item: IEC62443ZoneConduit) => (<Textarea
          value={item.notes || ''}
          rows={2}
          onChange={({ detail }) => handleUpdateZoneConduit(item.id, { notes: detail.value })}
        />),
      },
      {
        id: 'actions',
        header: '',
        cell: (item: IEC62443ZoneConduit) => (<Button
          variant='icon'
          iconName='remove'
          ariaLabel='Rimuovi'
          onClick={() => handleRemoveZoneConduit(item.id)}
        />),
        width: 60,
      },
    ]}
    items={zonesConduits}
    trackBy='id'
    wrapLines
    variant='container'
    empty={<Box textAlign='center' color='text-status-inactive' padding='m'>
      Nessuna zona o condotto definito. Usa i pulsanti in alto per aggiungerli.
    </Box>}
  />);
};

export default ZonesConduits;
