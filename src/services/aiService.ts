import { generateResponse } from './decisionEngine'
import type { AIAnalysis, SensitivityLevel, VolumeCategory, WasteCategory } from '../types/domain'

export interface AnalyzeWasteInput {
  fileName: string
  description: string
  scenarioHint?: WasteCategory
  sensitivity?: SensitivityLevel
}

export interface WasteAnalyzer {
  analyze(input: AnalyzeWasteInput): Promise<AIAnalysis>
}

const keywordRules: { category: WasteCategory; words: string[]; confidence: number }[] = [
  { category: 'Hazardous waste', words: ['hazard', 'chemical', 'medical', 'leak', 'battery'], confidence: 0.93 },
  { category: 'Construction debris', words: ['construction', 'debris', 'brick', 'concrete', 'rubble'], confidence: 0.94 },
  { category: 'Drain blockage', words: ['drain', 'blocked', 'waterlog'], confidence: 0.91 },
  { category: 'Organic waste', words: ['organic', 'food', 'market', 'vegetable'], confidence: 0.9 },
  { category: 'E-waste', words: ['e-waste', 'electronic', 'computer', 'cable'], confidence: 0.92 },
  { category: 'Plastic waste', words: ['plastic', 'bottle', 'packaging'], confidence: 0.89 },
  { category: 'Overflowing bin', words: ['overflow', 'bin'], confidence: 0.92 },
  { category: 'Garbage dump', words: ['dump', 'garbage', 'mixed'], confidence: 0.87 },
]

function inferVolume(text: string, category: WasteCategory): { volume: VolumeCategory; confidence: number } {
  if (/very large|massive|huge/.test(text)) return { volume: 'Very Large', confidence: 0.85 }
  if (/large|construction|debris/.test(text) || category === 'Construction debris') return { volume: 'Large', confidence: 0.82 }
  if (/small|few|minor/.test(text)) return { volume: 'Small', confidence: 0.86 }
  return { volume: 'Medium', confidence: 0.84 }
}

export class DeterministicPrototypeAnalyzer implements WasteAnalyzer {
  async analyze(input: AnalyzeWasteInput): Promise<AIAnalysis> {
    await new Promise((resolve) => setTimeout(resolve, 1200))
    const text = `${input.fileName} ${input.description}`.toLowerCase()
    const inferred = input.scenarioHint
      ? { category: input.scenarioHint, confidence: input.scenarioHint === 'Construction debris' ? 0.94 : 0.92 }
      : keywordRules.find((rule) => rule.words.some((word) => text.includes(word))) ?? { category: 'Garbage dump' as WasteCategory, confidence: 0.78 }
    const { volume, confidence: volumeConfidence } = inferVolume(text, inferred.category)
    const hazardFlags: string[] = []
    if (/drain|waterlog/.test(text) || (inferred.category === 'Construction debris' && /school|critical/.test(text))) hazardFlags.push('Drain blockage detected')
    if (inferred.category === 'Hazardous waste') hazardFlags.push('Possible chemical exposure')
    if (inferred.category === 'Organic waste' && volume !== 'Small') hazardFlags.push('Pest and hygiene risk')
    const response = generateResponse(inferred.category, volume, hazardFlags, input.sensitivity ?? 'MEDIUM')
    return {
      id: crypto.randomUUID(),
      categories: [{ category: inferred.category, confidence: inferred.confidence }],
      volumeCategory: volume,
      volumeConfidence,
      hazardFlags,
      recommendedAction: `${response.vehicleType} + ${response.workerCount} ${response.workerCount === 1 ? 'worker' : 'workers'}`,
      response,
      modelVersion: 'swachhlens-prototype-rules-1.0',
      isPrototype: true,
      createdAt: new Date().toISOString(),
    }
  }
}

class EdgeFunctionAnalyzer implements WasteAnalyzer {
  constructor(private endpoint: string, private authToken: string) {}
  async analyze(input: AnalyzeWasteInput): Promise<AIAnalysis> {
    const response = await fetch(this.endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.authToken}` }, body: JSON.stringify(input),
    })
    if (!response.ok) throw new Error('AI analysis service is temporarily unavailable.')
    return response.json() as Promise<AIAnalysis>
  }
}

export function createWasteAnalyzer(): WasteAnalyzer {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (url && key) return new EdgeFunctionAnalyzer(`${url}/functions/v1/analyze-waste`, key)
  return new DeterministicPrototypeAnalyzer()
}
