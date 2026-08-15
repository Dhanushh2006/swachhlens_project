import { describe, expect, it } from 'vitest'
import { calculateActionScore, generateResponse } from './decisionEngine'

describe('ActionScore decision engine',()=>{
  it('reproduces the critical construction waste scenario explainably',()=>{
    const result=calculateActionScore({volume:'Large',sensitivity:'HIGH',reportCount:7,ageHours:11,hazards:['Drain blockage detected']})
    expect(result.score).toBe(94)
    expect(result.priority).toBe('CRITICAL')
    expect(result.breakdown).toEqual({volume:25,locationSensitivity:25,reportFrequency:20,complaintAge:14,hazardContext:10})
  })
  it('routes hazardous waste to trained handling with escalation',()=>{
    const response=generateResponse('Hazardous waste','Medium',['Possible chemical exposure'],'MEDIUM')
    expect(response.teamType).toBe('Hazmat Response Unit')
    expect(response.vehicleType).toBe('Containment Vehicle')
    expect(response.escalation).toBe('IMMEDIATE')
  })
})
