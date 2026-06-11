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
import { mergeVulnerabilities, parseNessusXml } from '.';

beforeAll(() => {
  // il parser usa DOMParser (disponibile nel browser); nei test lo forniamo via jsdom
  // eslint-disable-next-line @typescript-eslint/no-require-imports, import/no-extraneous-dependencies
  const { JSDOM } = require('jsdom');
  (global as any).DOMParser = new JSDOM().window.DOMParser;
});

const SAMPLE_NESSUS = `<?xml version="1.0" ?>
<NessusClientData_v2>
  <Report name="Scan OT di prova">
    <ReportHost name="192.168.1.10">
      <ReportItem port="443" svc_name="www" protocol="tcp" severity="3" pluginID="51192" pluginName="SSL Certificate Cannot Be Trusted">
        <cvss_base_score>6.4</cvss_base_score>
        <cve>CVE-2000-0001</cve>
        <cve>CVE-2000-0002</cve>
      </ReportItem>
      <ReportItem port="0" svc_name="general" protocol="tcp" severity="0" pluginID="19506" pluginName="Nessus Scan Information"/>
      <ReportItem port="22" svc_name="ssh" protocol="tcp" severity="4" pluginID="12345" pluginName="Obsolete SSH Server">
        <cvss3_base_score>9.8</cvss3_base_score>
      </ReportItem>
    </ReportHost>
    <ReportHost name="192.168.1.11">
      <ReportItem port="80" svc_name="www" protocol="tcp" severity="2" pluginID="11111" pluginName="Outdated Web Server"/>
    </ReportHost>
  </Report>
</NessusClientData_v2>`;

describe('parseNessusXml', () => {
  test('extracts vulnerabilities sorted by severity, excluding info by default', () => {
    const result = parseNessusXml(SAMPLE_NESSUS);

    expect(result.scanName).toEqual('Scan OT di prova');
    expect(result.hostCount).toEqual(2);
    expect(result.vulnerabilities).toHaveLength(3);
    expect(result.vulnerabilities[0]).toMatchObject({
      host: '192.168.1.10',
      port: '22/tcp',
      name: 'Obsolete SSH Server',
      severity: 4,
      cvss: '9.8',
    });
    expect(result.vulnerabilities[1]).toMatchObject({
      severity: 3,
      cve: 'CVE-2000-0001, CVE-2000-0002',
      cvss: '6.4',
    });
  });

  test('includes informational findings when requested', () => {
    const result = parseNessusXml(SAMPLE_NESSUS, true);
    expect(result.vulnerabilities).toHaveLength(4);
    expect(result.vulnerabilities.filter(v => v.severity === 0)).toHaveLength(1);
  });

  test('throws on invalid xml', () => {
    expect(() => parseNessusXml('not xml at all <')).toThrow();
    expect(() => parseNessusXml('<root></root>')).toThrow('nessun elemento Report');
  });
});

describe('mergeVulnerabilities', () => {
  const vuln = (id: string, severity: number, host = 'h1'): any => ({ id, severity, host, name: id });

  test('appends new findings and deduplicates by id keeping the latest', () => {
    const existing = [vuln('a', 2), vuln('b', 4)];
    const incoming = [vuln('b', 3), vuln('c', 1)];

    const merged = mergeVulnerabilities(existing, incoming);

    expect(merged.map(v => v.id)).toEqual(['b', 'a', 'c']);
    // il duplicato 'b' prende i dati dell'import più recente
    expect(merged.find(v => v.id === 'b')?.severity).toEqual(3);
  });

  test('merges multiple lists imported at the same time', () => {
    const merged = mergeVulnerabilities([vuln('a', 1)], [vuln('b', 4)], [vuln('c', 2)]);
    expect(merged.map(v => v.id)).toEqual(['b', 'c', 'a']);
  });
});
