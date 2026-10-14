import { afterEach, describe, expect, it, vi } from 'vitest'
import { request, pollTask } from '@/lib/api/client'
import { mapReport } from '@/lib/api/guards'
import { createMockApi } from '@/lib/api/mock'
const report = () => ({
  id: 'r',
  version: '2',
  report_hash: 'hash2',
  review_status: 'published',
  access_state: 'active',
  authorized_for_current_session: true,
  expires_at: new Date(Date.now() + 60000).toISOString(),
  approval: { approved_version: '2', report_hash: 'hash2' },
  sources: {
    candidate_snapshot_id: 'c1',
    assessment_snapshot_id: 'a1',
    role_profile_id: null,
    rubric_version: 'rv1',
  },
  summary: '已审核摘要',
  skills: [
    {
      label: 'C',
      performance_state: 'not_tested',
      assessed_level: null,
      evidence: [],
    },
  ],
  recommendations: [],
  safe_resume_text: null,
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})
describe('报告契约守卫', () => {
  it('只接受匹配审核版本的授权报告，未测技能保持null', () => {
    expect(mapReport(report()).skills[0].level).toBe(null)
  })
  it.each(['pending_human_review', 'rejected', 'approved'])(
    '拒绝 %s 正文',
    (state) => {
      expect(() => mapReport({ ...report(), review_status: state })).toThrow()
    },
  )
  it.each(['expired', 'revoked'])('拒绝访问状态 %s', (state) => {
    expect(() => mapReport({ ...report(), access_state: state })).toThrow()
  })
  it('拒绝版本、hash、授权和有效期冲突', () => {
    expect(() => mapReport({ ...report(), version: '3' })).toThrow()
    expect(() => mapReport({ ...report(), report_hash: 'other' })).toThrow()
    expect(() =>
      mapReport({ ...report(), authorized_for_current_session: false }),
    ).toThrow()
    expect(() => mapReport({ ...report(), expires_at: '2000-01-01' })).toThrow()
  })
  it('拒绝没有证据的技术等级', () => {
    expect(() =>
      mapReport({
        ...report(),
        skills: [
          {
            label: 'C',
            performance_state: 'graded',
            assessed_level: 'L3',
            evidence: [],
          },
        ],
      }),
    ).toThrow()
  })
  it('拒绝空或非约定结构', () => {
    expect(() => mapReport(null)).toThrow()
    expect(() => mapReport({})).toThrow()
  })
})
describe('HTTP失败不伪装Mock成功', () => {
  it.each([401, 403, 409, 410, 422, 429, 500])('%s保持失败', async (status) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{}', { status })),
    )
    await expect(request('/api/v1/test')).rejects.toMatchObject({ status })
  })
  it('网络错误提示可恢复', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    await expect(request('/api/v1/test')).rejects.toThrow('网络连接失败')
  })
  it('任务失败不继续拿正文', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({ state: 'failed' }))),
    )
    await expect(pollTask('t')).rejects.toThrow('任务未完成')
  })
  it('超时中止请求', async () => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_path, opts: RequestInit) =>
          new Promise((_resolve, reject) =>
            opts.signal?.addEventListener('abort', () =>
              reject(new Error('aborted')),
            ),
          ),
      ),
    )
    const result = expect(request('/api/v1/test', {}, 10)).rejects.toThrow(
      '请求超时',
    )
    await vi.advanceTimersByTimeAsync(11)
    await result
  })
})
describe('Mock边界', () => {
  it('任意Python输入不会提取出STM32', async () => {
    const api = createMockApi()
    const c = await api.parseResume({
      text: '技能：Python\n项目经历：课程工具',
      file: null,
      consent: true,
    })
    expect(c.skills.map((s) => s.label)).toEqual(['Python'])
    expect(c.contribution).toBe('')
  })
  it('PDF不伪装解析成功', async () => {
    await expect(
      createMockApi().parseResume({
        file: new File(['pdf'], 'x.pdf', { type: 'application/pdf' }),
        text: '',
        consent: true,
      }),
    ).rejects.toThrow('不解析真实 PDF')
  })
  it('JD引用只来自当前文本', async () => {
    const req = await createMockApi().analyzeRole('Python 是加分项', 'mcu')
    expect(req).toEqual([
      {
        skill: 'Python',
        quote: 'Python 是加分项',
        importance: 'pending',
        confirmed: false,
      },
    ])
  })
  it('重复提交返回同一回执，永不直接发布', async () => {
    const api = createMockApi()
    const a = await api.submit('assessment', 'stable-key')
    expect(await api.submit('assessment', 'stable-key')).toBe(a)
    expect(a.canRequestReport).toBe(false)
  })
  it('删除立即撤销访问', async () => {
    const api = createMockApi()
    expect((await api.deleteData()).state).toBe('completed')
    await expect(api.reviewStatus('id')).rejects.toMatchObject({ status: 410 })
  })
})
