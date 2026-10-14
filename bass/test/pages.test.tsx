import { useEffect, useState } from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FlowProvider, useFlow } from '@/lib/flow-context'
import { ConfirmForm } from '@/components/confirm/confirm-form'
import { ReviewContent } from '@/components/review/review-content'
import { AssessmentContent } from '@/components/assessment/assessment-content'
import { QUESTION_BANKS } from '@/lib/api/fixtures'
import { SampleReportContent } from '@/components/report/sample-report-content'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { PublishedReport, ReviewStatus } from '@/lib/api/types'
import { SubmissionContent } from '@/components/submission/submission-content'
import { ReportContent } from '@/components/report/report-content'
vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
}))

function AssessmentHarness() {
  const [visible, setVisible] = useState(true)
  const f = useFlow()
  const { setMode, setFactsConfirmed, setAssessment } = f
  useEffect(() => {
    setMode('skillonly')
    setFactsConfirmed(true)
    setAssessment({
      id: 'test',
      version: '1',
      questions: QUESTION_BANKS.generic.map((q) => ({ ...q, version: '1' })),
    })
  }, [setMode, setFactsConfirmed, setAssessment])
  return (
    <>
      <button onClick={() => setVisible((v) => !v)}>切换页面</button>
      <output data-testid="counts">
        {f.answeredCount}/{f.skippedCount}
      </output>
      {visible && <AssessmentContent />}
    </>
  )
}
function StateHarness() {
  const { setSubmissionId } = useFlow()
  useEffect(() => setSubmissionId('submitted'), [setSubmissionId])
  return <ReportContent />
}
describe('页面回归基线', () => {
  it('确认页原文不冒充固定 STM32 示例', () => {
    render(
      <FlowProvider>
        <ConfirmForm />
      </FlowProvider>,
    )
    expect(screen.queryAllByText(/基于 STM32 的智能小车控制系统/)).toHaveLength(
      0,
    )
  })
  it('无项目不继续评价固定项目', () => {
    function Harness() {
      const [review, setReview] = useState(false)
      return (
        <>
          <button onClick={() => setReview(true)}>看初评</button>
          {review ? <ReviewContent /> : <ConfirmForm />}
        </>
      )
    }
    render(
      <FlowProvider>
        <Harness />
      </FlowProvider>,
    )
    fireEvent.click(screen.getByText('不提供项目材料也可以继续'))
    fireEvent.click(screen.getByText('看初评'))
    expect(
      screen.queryByText(/项目表达中的技术难点描述较简略/),
    ).not.toBeInTheDocument()
  })
  it('初评不补造 PWM 故障经历', async () => {
    function Seed() {
      const { setProjectName, setFactsConfirmed } = useFlow()
      useEffect(() => {
        setProjectName('真实课程项目')
        setFactsConfirmed(true)
      }, [setProjectName, setFactsConfirmed])
      return <ReviewContent />
    }
    render(
      <FlowProvider>
        <Seed />
      </FlowProvider>,
    )
    fireEvent.click(
      await screen.findByRole('button', { name: /RQ-04项目表达/ }),
    )
    expect(screen.queryByText(/解决了 PWM 频率/)).not.toBeInTheDocument()
  })
  it('问答草稿离开再入仍在', () => {
    render(
      <FlowProvider>
        <AssessmentHarness />
      </FlowProvider>,
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '我的真实回答' },
    })
    fireEvent.click(screen.getByText('切换页面'))
    fireEvent.click(screen.getByText('切换页面'))
    expect(screen.getByRole('textbox')).toHaveValue('我的真实回答')
  })
  it('跳过不计为已回答', async () => {
    render(
      <FlowProvider>
        <AssessmentHarness />
      </FlowProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: /跳过/ }))
    await waitFor(() =>
      expect(screen.getByTestId('counts')).toHaveTextContent('0/1'),
    )
  })
  it.each([
    ['pending_human_review', 'active'],
    ['needs_revision', 'active'],
    ['rejected', 'active'],
    ['approved', 'active'],
    ['published', 'expired'],
    ['published', 'revoked'],
  ] as const)('未获授权时 %s / %s 不请求报告正文', async (review, access) => {
    const status: ReviewStatus = {
      submissionId: 'submitted',
      review,
      access,
      processing: 'waiting',
      canRequestReport: false,
      reportVersion: null,
      message: '禁止访问正文',
    }
    vi.spyOn(api, 'reviewStatus').mockResolvedValue(status)
    const fetchReport = vi.spyOn(api, 'report')
    render(
      <FlowProvider>
        <StateHarness />
      </FlowProvider>,
    )
    await screen.findByText('禁止访问正文')
    expect(fetchReport).not.toHaveBeenCalled()
    expect(screen.queryByText('01 · 本次评估覆盖')).not.toBeInTheDocument()
  })
})

describe('示例复制失败反馈', () => {
  it('复制拒绝时不报成功或审批通过', async () => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    })
    render(
      <FlowProvider>
        <SampleReportContent />
      </FlowProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: '复制演示摘要' }))
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        '复制失败，请手动选择示例文本。',
      ),
    )
    expect(toast.success).not.toHaveBeenCalled()
    if (original) Object.defineProperty(navigator, 'clipboard', original)
    else
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: undefined,
      })
  })
})

describe('发布与提交边界', () => {
  const published: ReviewStatus = { submissionId:'submitted',review:'published',access:'active',processing:'completed',canRequestReport:true,reportVersion:'2',message:'授权发布' }
  const body = (): PublishedReport => ({ id:'report',version:'2',hash:'h2',authorized:true,review:'published',access:'active',expiresAt:new Date(Date.now()+60000).toISOString(),approval:{version:'2',hash:'h2'},sources:{candidateSnapshotId:'c1',assessmentSnapshotId:'a1',roleProfileId:null,rubricVersion:'r1'},summary:'后端授权的正式摘要',skills:[],recommendations:[],safeResumeText:null })
  it('匹配授权版本时渲染真实返回内容', async () => {
    vi.spyOn(api,'reviewStatus').mockResolvedValue(published)
    vi.spyOn(api,'report').mockResolvedValue(body())
    render(<FlowProvider><StateHarness /></FlowProvider>)
    expect(await screen.findByText('后端授权的正式摘要')).toBeInTheDocument()
  })
  it('发布状态与正文版本冲突时拒绝渲染', async () => {
    vi.spyOn(api,'reviewStatus').mockResolvedValue({...published,reportVersion:'3'})
    vi.spyOn(api,'report').mockResolvedValue(body())
    render(<FlowProvider><StateHarness /></FlowProvider>)
    await screen.findByRole('alert')
    expect(screen.queryByText('后端授权的正式摘要')).not.toBeInTheDocument()
  })
  it('连续点击提交只发送一次请求', async () => {
    function Seed(){
      const {setAssessment,setStatuses}=useFlow()
      useEffect(()=>{setAssessment({id:'one',version:'1',questions:[{...QUESTION_BANKS.generic[0],version:'1'}]});setStatuses({'Q-01':'answered'})},[setAssessment,setStatuses])
      return <SubmissionContent />
    }
    const submit=vi.spyOn(api,'submit')
    render(<FlowProvider><Seed /></FlowProvider>)
    const button=screen.getByRole('button',{name:'提交并等待人工复核'})
    fireEvent.click(button);fireEvent.click(button)
    await screen.findByRole('button',{name:'已提交，避免重复操作'})
    expect(submit).toHaveBeenCalledTimes(1)
  })
})
