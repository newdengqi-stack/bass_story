import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import fixture from './fixtures/resume-review.json'
import { mapResumeAnalysis } from '@/lib/resume-analysis'
import { FlowProvider, useFlow } from '@/lib/flow-context'
import { UploadForm } from '@/components/upload/upload-form'
import { InitialReviewContent } from '@/components/review/initial-review-content'

afterEach(() => vi.unstubAllGlobals())
describe('即时文本初评契约', () => {
  it('实际后端Mock响应可映射为六维和来源', () => {
    const result = mapResumeAnalysis(fixture)
    expect(result.dimensions).toHaveLength(6)
    expect(result.mode).toBe('mock')
    expect(result.findings[0].sourceIds.length).toBeGreaterThan(0)
  })
  it('重复维度、无效来源、确定性事实被拒绝', () => {
    const duplicate = structuredClone(fixture)
    duplicate.dimensions[0] = duplicate.dimensions[1]
    expect(() => mapResumeAnalysis(duplicate)).toThrow()
    const invalid = structuredClone(fixture)
    invalid.findings[0].source_span_ids = ['invented']
    expect(() => mapResumeAnalysis(invalid)).toThrow()
    expect(() =>
      mapResumeAnalysis({
        ...fixture,
        findings: [{ ...fixture.findings[0], confirmation_state: 'verified' }],
      }),
    ).toThrow()
  })
  it('文本初评展示问题、原因、原文和可执行建议', () => {
    render(<InitialReviewContent review={mapResumeAnalysis(fixture)} />)
    fireEvent.click(screen.getByRole('button', { name: /项目表达/ }))
    expect(screen.getByText(/原因：项目描述本身/)).toBeInTheDocument()
    expect(screen.getByText(/修改方向：补充本人实际承担/)).toBeInTheDocument()
    expect(screen.getAllByText(/原文依据/).length).toBeGreaterThan(0)
  })
  it('失败保留输入，可重新提交成功，不降级伪造结果', async () => {
    let posts = 0
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        if (url.endsWith('/health'))
          return Promise.resolve(
            new Response(
              JSON.stringify({ ai_mode: 'mock', model_configured: true }),
            ),
          )
        posts++
        return Promise.resolve(
          new Response(
            JSON.stringify(
              posts === 1
                ? {
                    error: {
                      code: 'MODEL_TIMEOUT',
                      message: '模型响应超时，输入仍保留',
                    },
                  }
                : fixture,
            ),
            { status: posts === 1 ? 504 : 200 },
          ),
        )
      }),
    )
    function Harness() {
      const { initialReview } = useFlow()
      return initialReview ? (
        <InitialReviewContent review={initialReview} />
      ) : (
        <UploadForm />
      )
    }
    render(
      <FlowProvider>
        <Harness />
      </FlowProvider>,
    )
    const text = fixture.sources[0].quote
    fireEvent.change(screen.getByRole('textbox', { name: '粘贴简历文本' }), {
      target: { value: text },
    })
    fireEvent.click(screen.getByRole('checkbox', { name: /我同意将本次文本/ }))
    fireEvent.click(screen.getByRole('button', { name: '分析简历文本' }))
    await screen.findByText('模型响应超时，输入仍保留')
    expect(screen.getByRole('textbox', { name: '粘贴简历文本' })).toHaveValue(
      text,
    )
    expect(screen.queryByText('六维文字初评')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '分析简历文本' }))
    await waitFor(() =>
      expect(screen.getByText('六维文字初评')).toBeInTheDocument(),
    )
    expect(posts).toBe(2)
  })
})
