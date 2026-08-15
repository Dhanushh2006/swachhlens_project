import { describe, expect, it } from 'vitest'
import { mediaFileToDataUrl } from './utils'

describe('citizen media validation',()=>{
  it('rejects unsupported report files with a useful message',async()=>{
    const file=new File(['not media'],'report.pdf',{type:'application/pdf'})
    await expect(mediaFileToDataUrl(file)).rejects.toThrow('JPG, PNG, WebP, MP4 or WebM')
  })
  it('rejects oversized media before attempting upload',async()=>{
    const file=new File([new Uint8Array(8*1024*1024+1)],'long-video.mp4',{type:'video/mp4'})
    await expect(mediaFileToDataUrl(file)).rejects.toThrow('larger than 8 MB')
  })
})
