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
import SpaceBetween from '@cloudscape-design/components/space-between';
import { FC } from 'react';
import { useDataflowInfoContext } from '../../../contexts/DataflowContext/context';
import { DataflowInfoSchema, EditableComponentBaseProps } from '../../../customTypes';
import BaseDiagramInfo from '../../generic/BaseDiagramInfo';
import ZonesConduits from '../../iec62443/ZonesConduits';

const DataflowInfo: FC<EditableComponentBaseProps> = (props) => {
  const { dataflowInfo, setDataflowInfo } = useDataflowInfoContext();
  return (<SpaceBetween direction='vertical' size='l'>
    <BaseDiagramInfo
      {...props}
      headerTitle='Dataflow'
      diagramTitle='Dataflow Diagram'
      entity={dataflowInfo}
      onConfirm={(diagram) => setDataflowInfo(diagram)}
      validateData={DataflowInfoSchema.shape.description.safeParse}
    />
    <ZonesConduits />
  </SpaceBetween>);
};

export default DataflowInfo;