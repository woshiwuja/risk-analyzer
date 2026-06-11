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

import { getApplicationInfoContent } from './utils/getApplicationInfo';
import { getApplicationName } from './utils/getApplicationName';
import { getArchitectureContent } from './utils/getArchitecture';
import { getAssetsContent } from './utils/getAssets';
import { getAssumptionsContent } from './utils/getAssumptions';
import { getDataflowContent } from './utils/getDataFlow';
import { getExecutiveSummaryContent } from './utils/getExecutiveSummary';
import { getIEC62443ComponentAssessmentContent } from './utils/getIEC62443ComponentAssessment';
import { getIEC62443RiskAnalysisContent } from './utils/getIEC62443RiskAnalysis';
import { getMitigationsContent } from './utils/getMitigations';
import { getThreatsContent } from './utils/getThreats';
import { getVulnerabilityAssessmentContent } from './utils/getVulnerabilityAssessment';
import { DataExchangeFormat, ReportType } from '../../customTypes';
import hasContent from '../hasContent';
import sanitizeHtml from '../sanitizeHtml';

const convertToMarkdown = async (data: DataExchangeFormat, composerMode = 'Full', reportType: ReportType = 'full') => {
  const sanitizedData = sanitizeHtml(data);
  const [_, hasContentDetails] = hasContent(data);

  if (composerMode !== 'Full') {
    return [await getThreatsContent(sanitizedData, true)].filter(x => !!x).join('\n');
  }

  let sections: (string | false)[];

  switch (reportType) {
    // Vista executive: dashboard di sintesi e conformità normativa, senza dettagli operativi
    case 'executive':
      sections = [
        (!hasContentDetails || hasContentDetails.applicationName) && await getApplicationName(sanitizedData),
        (!hasContentDetails || hasContentDetails.applicationInfo) && await getApplicationInfoContent(sanitizedData),
        await getExecutiveSummaryContent(sanitizedData),
        await getIEC62443RiskAnalysisContent(sanitizedData),
        await getIEC62443ComponentAssessmentContent(sanitizedData),
      ];
      break;
    // Vista operativa: solo minacce, vulnerabilità, assunzioni e mitigazioni
    case 'operational':
      sections = [
        (!hasContentDetails || hasContentDetails.applicationName) && await getApplicationName(sanitizedData),
        (!hasContentDetails || hasContentDetails.assumptions) && await getAssumptionsContent(sanitizedData),
        (!hasContentDetails || hasContentDetails.threats) && await getThreatsContent(sanitizedData),
        (!hasContentDetails || hasContentDetails.mitigations) && await getMitigationsContent(sanitizedData),
        await getVulnerabilityAssessmentContent(sanitizedData),
      ];
      break;
    // Vista completa/interna: tutte le sezioni
    default:
      sections = [
        (!hasContentDetails || hasContentDetails.applicationName) && await getApplicationName(sanitizedData),
        (!hasContentDetails || hasContentDetails.applicationInfo) && await getApplicationInfoContent(sanitizedData),
        (!hasContentDetails || hasContentDetails.architecture) && await getArchitectureContent(sanitizedData),
        (!hasContentDetails || hasContentDetails.dataflow) && await getDataflowContent(sanitizedData),
        (!hasContentDetails || hasContentDetails.assumptions) && await getAssumptionsContent(sanitizedData),
        (!hasContentDetails || hasContentDetails.threats) && await getThreatsContent(sanitizedData),
        (!hasContentDetails || hasContentDetails.mitigations) && await getMitigationsContent(sanitizedData),
        (!hasContentDetails || hasContentDetails.threats) && await getAssetsContent(sanitizedData),
        (!hasContentDetails || Object.values(hasContentDetails).some(x => x)) && await getIEC62443RiskAnalysisContent(sanitizedData),
        await getVulnerabilityAssessmentContent(sanitizedData),
        await getIEC62443ComponentAssessmentContent(sanitizedData),
      ];
      break;
  }

  return sections.filter(x => !!x).join('\n');
};

export default convertToMarkdown;
