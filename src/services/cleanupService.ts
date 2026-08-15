import type { CleanupVerification } from '../types/domain'

export async function verifyCleanup(incidentId: string, imageName: string, imageUrl: string): Promise<CleanupVerification> {
  await new Promise((resolve) => setTimeout(resolve, 1100))
  const requiresReview = /unclear|dark|blur|fail/i.test(imageName)
  return {
    id: crypto.randomUUID(), incidentId, afterMediaPath: imageUrl,
    verificationStatus: requiresReview ? 'MANUAL_REVIEW' : 'VERIFIED',
    confidence: requiresReview ? 0.58 : 0.93,
    remainingWasteIndicator: requiresReview ? 'MEDIUM' : 'LOW',
    createdAt: new Date().toISOString(),
  }
}
