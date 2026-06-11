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
import { DataExchangeFormat, ReportType } from '@aws/threat-composer';
import { useCallback } from 'react';
import { generatePath } from 'react-router-dom';
import { ROUTE_PREVIEW } from '../../config/routes';

const TEMP_PREVIEW_DATA_KEY = 'ThreatStatementGenerator.TempPreviewData';
const ROUTE_BASE_PATH = process.env.REACT_APP_ROUTE_BASE_PATH;

/**
 * Il report mostra solo i metadati degli allegati VA: il loro contenuto base64 (anche MB)
 * non serve all'anteprima e duplicarlo nel localStorage sfora la quota del browser.
 */
const stripHeavyContent = (data: DataExchangeFormat): DataExchangeFormat => {
  const vulnerabilityAssessment = data.iec62443Analysis?.vulnerabilityAssessment;
  if (!vulnerabilityAssessment?.documents?.length) {
    return data;
  }
  return {
    ...data,
    iec62443Analysis: {
      ...data.iec62443Analysis!,
      vulnerabilityAssessment: {
        ...vulnerabilityAssessment,
        documents: vulnerabilityAssessment.documents.map(d => ({ ...d, content: '' })),
      },
    },
  };
};

const useOnPreview = (reportType: ReportType = 'full') => {
  const handlePreview = useCallback((data: DataExchangeFormat) => {
    // il reportType viaggia insieme ai dati così la finestra di stampa rende la stessa vista
    try {
      window.localStorage.setItem(TEMP_PREVIEW_DATA_KEY, JSON.stringify({ reportType, data: stripHeavyContent(data) }));
    } catch (e) {
      window.localStorage.removeItem(TEMP_PREVIEW_DATA_KEY);
      // eslint-disable-next-line no-alert
      window.alert('Impossibile aprire l\'anteprima di stampa: i dati del workspace superano la quota di archiviazione del browser. ' +
        'Riduci gli allegati (es. immagini di architettura/dataflow molto grandi) e riprova.');
      return;
    }
    const url = `${ROUTE_BASE_PATH || ''}${generatePath(ROUTE_PREVIEW, {
      dataKey: TEMP_PREVIEW_DATA_KEY,
    })}`;

    window.open(url, '_blank', 'noopener,noreferrer,resizable');
  }, [reportType]);

  return [handlePreview] as [(data: DataExchangeFormat) => void];
};

export default useOnPreview;
