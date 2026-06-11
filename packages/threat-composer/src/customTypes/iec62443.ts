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
import { z } from 'zod';
import { FREE_TEXT_INPUT_MAX_LENGTH, SINGLE_FIELD_INPUT_MAX_LENGTH } from '../configs';

export const IEC62443_STATUSES = ['covered', 'partial', 'missing'] as const;

export const IEC62443_STATUS_LABELS: Record<typeof IEC62443_STATUSES[number], string> = {
  covered: 'Coperto',
  partial: 'Parziale',
  missing: 'Mancante',
};

export const IEC62443_PRIORITIES = ['Critica', 'Alta', 'Media', 'Bassa'] as const;

/**
 * Scala di danno (business damage) a 4 livelli, valutata per dimensione HSE / produzione / finanziaria.
 * Il valore è l'indice 1-based nella scala.
 */
export const IEC62443_DAMAGE_LEVELS = ['Trascurabile', 'Marginale', 'Critico', 'Catastrofico'] as const;

/**
 * Scala di probabilità (likelihood) a 4 livelli. Il valore è l'indice 1-based nella scala.
 */
export const IEC62443_LIKELIHOOD_LEVELS = ['Improbabile', 'Possibile', 'Probabile', 'Frequente'] as const;

export const IEC62443_RISK_LEVELS = ['Basso', 'Medio', 'Alto', 'Critico'] as const;

export type IEC62443RiskLevel = typeof IEC62443_RISK_LEVELS[number];

export const IEC62443_SECURITY_LEVELS = ['SL 0', 'SL 1', 'SL 2', 'SL 3', 'SL 4'] as const;

export const IEC62443FindingSchema = z.object({
  id: z.string().max(36).describe('Stable identifier of the ZCR requirement (e.g. zcr-5.6)'),
  requirement: z.string().max(SINGLE_FIELD_INPUT_MAX_LENGTH).describe('The IEC 62443-3-2 requirement (e.g. ZCR 5.6 — SL-T per zona/condotto)'),
  status: z.enum(IEC62443_STATUSES).describe('Coverage status of the requirement in this threat model'),
  detail: z.string().max(FREE_TEXT_INPUT_MAX_LENGTH).describe('Evidence when covered, or description of the gap when partial/missing'),
  priority: z.enum(IEC62443_PRIORITIES).describe('Priority of addressing the gap'),
  implementation: z.string().max(FREE_TEXT_INPUT_MAX_LENGTH).optional().describe('Explanation of how the requirement is (or will be) implemented'),
}).strict();

export type IEC62443Finding = z.infer<typeof IEC62443FindingSchema>;

export const IEC62443ZoneConduitSchema = z.object({
  id: z.string().max(36).describe('UUID v4 identifier'),
  name: z.string().max(SINGLE_FIELD_INPUT_MAX_LENGTH).describe('Name of the zone or conduit'),
  type: z.enum(['Zona', 'Condotto']).describe('Whether this entry is a zone or a conduit'),
  description: z.string().max(FREE_TEXT_INPUT_MAX_LENGTH).describe('Description, included assets and (for conduits) connected zones/data flows'),
  slT: z.enum(IEC62443_SECURITY_LEVELS).describe('Security Level Target (IEC 62443-3-3)'),
  notes: z.string().max(FREE_TEXT_INPUT_MAX_LENGTH).optional().describe('Notes: safety designation, temporary devices, wireless, accountable organization'),
}).strict();

export type IEC62443ZoneConduit = z.infer<typeof IEC62443ZoneConduitSchema>;

export const IEC62443ThreatAssessmentSchema = z.object({
  threatId: z.string().max(36).describe('Id of the assessed threat statement'),
  hse: z.number().min(1).max(4).optional().describe('Health/Safety/Environment damage level (1-4)'),
  production: z.number().min(1).max(4).optional().describe('Production/operations damage level (1-4)'),
  financial: z.number().min(1).max(4).optional().describe('Financial damage level (1-4)'),
  likelihood: z.number().min(1).max(4).optional().describe('Unmitigated likelihood level (1-4)'),
  residualLikelihood: z.number().min(1).max(4).optional().describe('Residual likelihood level post-mitigation (1-4)'),
  notes: z.string().max(FREE_TEXT_INPUT_MAX_LENGTH).optional().describe('Explanation of the assessment and of implemented countermeasures'),
}).strict();

export type IEC62443ThreatAssessment = z.infer<typeof IEC62443ThreatAssessmentSchema>;

/**
 * Stati di conformità per i requisiti componente di IEC 62443-4-2 (FSA).
 */
export const IEC62443_4_2_STATUSES = ['satisfied', 'satisfiedIntegration', 'notSatisfied', 'notRelevant', 'notApplicable'] as const;

export const IEC62443_4_2_STATUS_LABELS: Record<typeof IEC62443_4_2_STATUSES[number], string> = {
  satisfied: 'a. Soddisfatto',
  satisfiedIntegration: 'b. Soddisfatto tramite integrazione nel sistema',
  notSatisfied: 'Non soddisfatto',
  notRelevant: 'c. Non pertinente',
  notApplicable: 'Non applicabile',
};

export const IEC62443ComponentAssessmentItemSchema = z.object({
  requirementId: z.string().max(SINGLE_FIELD_INPUT_MAX_LENGTH).describe('Id of the IEC 62443-4-2 requirement (e.g. FSA-CR 1.1)'),
  status: z.enum(IEC62443_4_2_STATUSES).optional().describe('Compliance status of the requirement'),
  notes: z.string().max(FREE_TEXT_INPUT_MAX_LENGTH).optional().describe('Explanation of how the requirement is met or why it is not applicable'),
  effort: z.string().max(SINGLE_FIELD_INPUT_MAX_LENGTH).optional().describe('Estimated effort to reach compliance'),
}).strict();

export type IEC62443ComponentAssessmentItem = z.infer<typeof IEC62443ComponentAssessmentItemSchema>;

export const IEC62443ComponentAssessmentSchema = z.object({
  slTarget: z.number().min(1).max(4).optional().describe('Security Level Target of the component under assessment'),
  componentName: z.string().max(SINGLE_FIELD_INPUT_MAX_LENGTH).optional().describe('Name of the component under assessment'),
  items: IEC62443ComponentAssessmentItemSchema.array().describe('Per-requirement compliance assessments'),
}).strict();

export type IEC62443ComponentAssessment = z.infer<typeof IEC62443ComponentAssessmentSchema>;

/**
 * Classificazione di riservatezza dei contenuti dell'assessment (ZCR 5.13).
 */
export const IEC62443_CONFIDENTIALITY_LEVELS = ['Pubblico', 'Uso interno', 'Riservato', 'Strettamente riservato'] as const;

/**
 * Severità delle vulnerabilità (scala Nessus 0-4).
 */
export const VA_SEVERITY_LABELS = ['Info', 'Bassa', 'Media', 'Alta', 'Critica'] as const;

export const VASessionSchema = z.object({
  id: z.string().max(36).describe('UUID v4 identifier'),
  date: z.string().max(SINGLE_FIELD_INPUT_MAX_LENGTH).describe('Date of the assessment session'),
  description: z.string().max(FREE_TEXT_INPUT_MAX_LENGTH).optional().describe('Scope and description of the session'),
  participants: z.string().max(FREE_TEXT_INPUT_MAX_LENGTH).optional().describe('Participants and their roles'),
  classification: z.enum(IEC62443_CONFIDENTIALITY_LEVELS).optional().describe('Confidentiality classification of the session output'),
}).strict();

export type VASession = z.infer<typeof VASessionSchema>;

export const VAReportDocumentSchema = z.object({
  id: z.string().max(36).describe('UUID v4 identifier'),
  name: z.string().max(SINGLE_FIELD_INPUT_MAX_LENGTH).describe('File name of the uploaded report'),
  mimeType: z.string().max(SINGLE_FIELD_INPUT_MAX_LENGTH).describe('MIME type of the uploaded report (PDF or HTML)'),
  size: z.number().describe('File size in bytes'),
  uploadedAt: z.string().max(SINGLE_FIELD_INPUT_MAX_LENGTH).describe('Upload timestamp (ISO 8601)'),
  content: z.string().describe('File content as base64 data URL'),
}).strict();

export type VAReportDocument = z.infer<typeof VAReportDocumentSchema>;

export const VAVulnerabilitySchema = z.object({
  id: z.string().max(64).describe('Stable identifier of the finding (host/port/plugin)'),
  host: z.string().max(SINGLE_FIELD_INPUT_MAX_LENGTH).describe('Affected host'),
  port: z.string().max(SINGLE_FIELD_INPUT_MAX_LENGTH).optional().describe('Affected port/protocol'),
  pluginId: z.string().max(SINGLE_FIELD_INPUT_MAX_LENGTH).optional().describe('Scanner plugin id'),
  name: z.string().max(SINGLE_FIELD_INPUT_MAX_LENGTH).describe('Vulnerability name'),
  severity: z.number().min(0).max(4).describe('Severity 0 (info) to 4 (critical)'),
  cvss: z.string().max(SINGLE_FIELD_INPUT_MAX_LENGTH).optional().describe('CVSS base score'),
  cve: z.string().max(FREE_TEXT_INPUT_MAX_LENGTH).optional().describe('Associated CVE identifiers'),
}).strict();

export type VAVulnerability = z.infer<typeof VAVulnerabilitySchema>;

export const VulnerabilityAssessmentSchema = z.object({
  sessions: VASessionSchema.array().optional().describe('Assessment sessions with participants, roles and confidentiality classification (ZCR 5.13)'),
  documents: VAReportDocumentSchema.array().optional().describe('Uploaded vulnerability assessment reports (HTML/PDF)'),
  vulnerabilities: VAVulnerabilitySchema.array().optional().describe('Vulnerabilities imported from scanner output (.nessus)'),
  nessusFileName: z.string().max(SINGLE_FIELD_INPUT_MAX_LENGTH).optional().describe('Name of the imported .nessus file (legacy, single import)'),
  nessusFiles: z.string().max(SINGLE_FIELD_INPUT_MAX_LENGTH).array().optional().describe('Names of all imported .nessus files contributing to the vulnerability list'),
  importedAt: z.string().max(SINGLE_FIELD_INPUT_MAX_LENGTH).optional().describe('Timestamp of the last .nessus import (ISO 8601)'),
}).strict();

export type VulnerabilityAssessment = z.infer<typeof VulnerabilityAssessmentSchema>;

export const IEC62443AnalysisSchema = z.object({
  findings: IEC62443FindingSchema.array().describe('Per-requirement IEC 62443-3-2 risk assessment findings'),
  zonesConduits: IEC62443ZoneConduitSchema.array().optional().describe('Zones and conduits of the System under Consideration with their Security Level Targets'),
  threatAssessments: IEC62443ThreatAssessmentSchema.array().optional().describe('Per-threat business damage and likelihood assessments'),
  toleranceLevel: z.enum(IEC62443_RISK_LEVELS).optional().describe('Maximum tolerable risk level'),
  toleranceJustification: z.string().max(FREE_TEXT_INPUT_MAX_LENGTH).optional().describe('Justification and criteria for the tolerable risk threshold'),
  componentAssessment: IEC62443ComponentAssessmentSchema.optional().describe('IEC 62443-4-2 component requirements (FSA) compliance assessment'),
  vulnerabilityAssessment: VulnerabilityAssessmentSchema.optional().describe('Vulnerability assessment documentation: sessions, reports and imported scanner findings (ZCR 5.2, ZCR 5.13)'),
}).strict();

export type IEC62443Analysis = z.infer<typeof IEC62443AnalysisSchema>;

export const IEC62443_ANALYSIS_DEFAULT_VALUE: IEC62443Analysis = {
  findings: [],
};

export const hasIEC62443Content = (analysis?: IEC62443Analysis): boolean => !!analysis && (
  analysis.findings.length > 0 ||
  (analysis.zonesConduits?.length || 0) > 0 ||
  (analysis.threatAssessments?.length || 0) > 0 ||
  !!analysis.toleranceLevel ||
  !!analysis.toleranceJustification ||
  (analysis.componentAssessment?.items?.length || 0) > 0 ||
  !!analysis.componentAssessment?.slTarget ||
  !!analysis.componentAssessment?.componentName ||
  (analysis.vulnerabilityAssessment?.sessions?.length || 0) > 0 ||
  (analysis.vulnerabilityAssessment?.documents?.length || 0) > 0 ||
  (analysis.vulnerabilityAssessment?.vulnerabilities?.length || 0) > 0
);
