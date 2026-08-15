import { describe, expect, it } from 'vitest'
import { detectDuplicate } from './duplicateService'
import { createDemoState } from '../data/demoSeed'

describe('duplicate intelligence',()=>{
  it('links a nearby, recent report in the same category',()=>{
    const incidents=createDemoState().incidents
    const match=detectDuplicate({latitude:12.9718,longitude:77.5948,category:'Construction debris',capturedAt:new Date().toISOString()},incidents)
    expect(match?.matchingIncidentId).toBe('SW-2048')
    expect(match?.probability).toBeGreaterThanOrEqual(.9)
    expect(match?.reasons).toContain('Same waste category')
  })
  it('always resolves a supporting match to the canonical master incident',()=>{
    const match=detectDuplicate({latitude:12.9725,longitude:77.5955,category:'Construction debris',capturedAt:new Date().toISOString()},createDemoState().incidents)
    expect(match?.matchingIncidentId).toBe('SW-2048')
  })
  it('does not link a distant unrelated issue',()=>{
    const match=detectDuplicate({latitude:11,longitude:75,category:'E-waste',capturedAt:new Date().toISOString()},createDemoState().incidents)
    expect(match).toBeNull()
  })
})
