import { describe, expect, it } from 'vitest'
import { canTransition } from './decisionRules'

describe('incident status engine',()=>{
  it('allows only the next state',()=>{
    expect(canTransition('ASSIGNED','ACCEPTED')).toBe(true)
    expect(canTransition('ASSIGNED','DISPATCHED')).toBe(false)
    expect(canTransition('RESOLVED','REPORTED')).toBe(false)
  })
})
