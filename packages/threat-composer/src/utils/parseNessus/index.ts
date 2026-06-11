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
import { VAVulnerability } from '../../customTypes';

export interface ParsedNessus {
  vulnerabilities: VAVulnerability[];
  hostCount: number;
  scanName?: string;
}

/**
 * Parsa un export Nessus (.nessus, formato NessusClientData_v2) ed estrae le vulnerabilità rilevate.
 * Le righe "informational" (severity 0) sono incluse solo se includeInfo è true.
 */
export const parseNessusXml = (xml: string, includeInfo = false): ParsedNessus => {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');

  if (doc.getElementsByTagName('parsererror').length > 0) {
    throw new Error('File .nessus non valido: errore di parsing XML');
  }

  const report = doc.getElementsByTagName('Report')[0];
  const hosts = Array.from(doc.getElementsByTagName('ReportHost'));

  if (!report && hosts.length === 0) {
    throw new Error('File .nessus non valido: nessun elemento Report/ReportHost trovato');
  }

  const vulnerabilities: VAVulnerability[] = [];

  hosts.forEach(host => {
    const hostName = host.getAttribute('name') || 'unknown';
    Array.from(host.getElementsByTagName('ReportItem')).forEach(item => {
      const severity = parseInt(item.getAttribute('severity') || '0', 10);
      if (!includeInfo && severity === 0) {
        return;
      }

      const pluginId = item.getAttribute('pluginID') || '';
      const port = item.getAttribute('port') || '0';
      const protocol = item.getAttribute('protocol') || '';
      const cvss3 = item.getElementsByTagName('cvss3_base_score')[0]?.textContent;
      const cvss2 = item.getElementsByTagName('cvss_base_score')[0]?.textContent;
      const cves = Array.from(item.getElementsByTagName('cve')).map(c => c.textContent).filter(c => !!c);

      vulnerabilities.push({
        id: `${hostName}/${protocol}:${port}/${pluginId}`,
        host: hostName,
        port: port !== '0' ? `${port}/${protocol}` : undefined,
        pluginId: pluginId || undefined,
        name: item.getAttribute('pluginName') || `Plugin ${pluginId}`,
        severity: Math.min(Math.max(severity, 0), 4),
        cvss: cvss3 || cvss2 || undefined,
        cve: cves.length > 0 ? cves.join(', ') : undefined,
      });
    });
  });

  sortVulnerabilities(vulnerabilities);

  return {
    vulnerabilities,
    hostCount: hosts.length,
    scanName: report?.getAttribute('name') || undefined,
  };
};

export const sortVulnerabilities = (vulnerabilities: VAVulnerability[]) =>
  vulnerabilities.sort((a, b) => b.severity - a.severity || a.host.localeCompare(b.host));

/**
 * Unisce più liste di vulnerabilità deduplicando per id (host/porta/plugin);
 * in caso di duplicato vince l'occorrenza più recente (ultima lista).
 */
export const mergeVulnerabilities = (...lists: VAVulnerability[][]): VAVulnerability[] => {
  const byId = new Map<string, VAVulnerability>();
  lists.flat().forEach(v => byId.set(v.id, v));
  return sortVulnerabilities([...byId.values()]);
};
