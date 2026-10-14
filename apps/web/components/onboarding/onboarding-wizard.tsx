'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, CircleAlert, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SAMPLE_JD } from '@/lib/jd-parse'
import { PARSED_DRAFT, SAMPLE_RESUME, type ParsedItem } from '@/lib/mock-data'
import { StepIndicator } from '@/components/shared/step-indicator'

const STEPS = ['建目标岗位', '导入简历', '确认解析', '选择代表项目'] as const

const CANDIDATE_PROJECTS = ['智能温控终端', '四轴无人机飞控', '智能家居网关']

const inputCls =
  'w-full rounded-xl border border-[var(--ws-ghost-line)] bg-[var(--ws-field)] px-4 py-3 text-[15px] text-[var(--ws-ink)] placeholder-[var(--ws-muted)] outline-none transition-colors focus:border-[var(--ws-sand)] focus:bg-[var(--ws-ghost)]'

/** 解析最少需要的字数 —— 低于它就不假装能拆出东西 */
const MIN_PARSE_CHARS = 20

export function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)

  const [title, setTitle] = useState('')
  const [jd, setJd] = useState('')
  const [resumeText, setResumeText] = useState('')

  const [parsed, setParsed] = useState<ParsedItem[]>([])
  const [parseFailed, setParseFailed] = useState(false)
  const [manual, setManual] = useState<string[]>([])

  const [picked, setPicked] = useState<string[]>([])
  const [askSkip, setAskSkip] = useState(false)

  const goNext = () => {
    if (step === 1) {
      // 解析：内容太短就不硬拆，转到手工补录分支
      const ok = resumeText.trim().length >= MIN_PARSE_CHARS
      setParseFailed(!ok)
      setParsed(ok ? PARSED_DRAFT.map((i) => ({ ...i })) : [])
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const goBack = () => setStep((s) => Math.max(s - 1, 0))

  const toggleProject = (name: string) => {
    setPicked((prev) => (prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]))
  }

  const toggleParsed = (id: string) => {
    setParsed((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <div className="mt-10">
      <StepIndicator steps={STEPS} current={step} ariaLabel="首次引导进度" />

      <div className="mt-10 min-h-[18rem]">
        {step === 0 && (
          <section aria-labelledby="s0">
            <h2 id="s0" className="text-[22px] font-semibold tracking-tight text-[var(--ws-ink)]">
              先定一个目标岗位
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--ws-ink-2)]">
              整套准备都围绕一个具体岗位展开。没有 JD，后面的差距分析只能靠猜。
            </p>

            <div className="mt-7 flex flex-col gap-6">
              <div>
                <label htmlFor="ob-title" className="mb-2 block text-[13px] text-[var(--ws-ink-2)]">
                  岗位名称 <span className="text-[var(--ws-sand)]">*</span>
                </label>
                <input
                  id="ob-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例：嵌入式软件实习生"
                  className={inputCls}
                />
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="ob-jd" className="text-[13px] text-[var(--ws-ink-2)]">
                    JD 原文
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setTitle('嵌入式软件实习生')
                      setJd(SAMPLE_JD)
                    }}
                    className="rounded-full border border-[var(--ws-ghost-line)] px-3 py-1 text-[12px] text-[var(--ws-muted)] transition-colors hover:text-[var(--ws-ink)]"
                  >
                    填入示例 JD
                  </button>
                </div>
                <textarea
                  id="ob-jd"
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  rows={8}
                  placeholder="把岗位描述整段粘贴进来。"
                  className={cn(inputCls, 'resize-y font-mono text-[13px] leading-relaxed')}
                />
              </div>
            </div>
          </section>
        )}

        {step === 1 && (
          <section aria-labelledby="s1">
            <h2 id="s1" className="text-[22px] font-semibold tracking-tight text-[var(--ws-ink)]">
              导入简历
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--ws-ink-2)]">
              粘贴简历正文。解析只做提取，不做验证 —— 拆出来的每一条进来时都是「用户声明」。
            </p>

            <div className="mt-7">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="ob-resume" className="text-[13px] text-[var(--ws-ink-2)]">
                  简历文本
                </label>
                <button
                  type="button"
                  onClick={() => setResumeText(SAMPLE_RESUME)}
                  className="rounded-full border border-[var(--ws-ghost-line)] px-3 py-1 text-[12px] text-[var(--ws-muted)] transition-colors hover:text-[var(--ws-ink)]"
                >
                  填入示例简历
                </button>
              </div>
              <textarea
                id="ob-resume"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={10}
                placeholder="教育经历、项目经历、技能都放进来。"
                className={cn(inputCls, 'resize-y font-mono text-[13px] leading-relaxed')}
              />
              <p className="mt-2 text-[12px] text-[var(--ws-muted)]">
                目前只支持粘贴文本 · {resumeText.length} 字
              </p>
            </div>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="s2">
            <h2 id="s2" className="text-[22px] font-semibold tracking-tight text-[var(--ws-ink)]">
              确认解析结果
            </h2>

            {parseFailed ? (
              <>
                <p
                  role="note"
                  className="ws-ghost-box mt-5 flex items-start gap-3 px-5 py-4 text-[14px] leading-relaxed text-[var(--ws-ink-2)]"
                >
                  <CircleAlert className="mt-0.5 size-4 shrink-0 text-[var(--ws-warn)]" aria-hidden="true" />
                  <span>
                    粘贴的内容太短，没能拆出条目。修正上一步的简历文本，或者
                    <span className="text-[var(--ws-ink)]">在这里手工录入项目和技能</span>，同样可以继续。
                  </span>
                </p>

                <div className="mt-7">
                  <p className="text-[13px] text-[var(--ws-ink-2)]">手工录入</p>
                  <ul className="mt-3 flex flex-col gap-3">
                    {manual.map((m, i) => (
                      <li key={`${m}-${i}`} className="flex items-center gap-2">
                        <input
                          value={m}
                          onChange={(e) =>
                            setManual((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))
                          }
                          aria-label={`手工录入第 ${i + 1} 条`}
                          className={cn(inputCls, 'flex-1 py-2 text-[14px]')}
                        />
                        <button
                          type="button"
                          onClick={() => setManual((prev) => prev.filter((_, idx) => idx !== i))}
                          aria-label={`删除第 ${i + 1} 条`}
                          className="rounded-full p-2 text-[var(--ws-miss)]"
                        >
                          <Trash2 className="size-3.5" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => setManual((prev) => [...prev, ''])}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[var(--ws-ghost-line)] px-3.5 py-1.5 text-[13px] text-[var(--ws-ink-2)] transition-colors hover:text-[var(--ws-ink)]"
                  >
                    <Plus className="size-3.5" aria-hidden="true" />
                    添加一条
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--ws-ink-2)]">
                  共拆出 {parsed.length} 条。不需要的可以删掉，剩下的会以「用户声明」保存。
                </p>
                <ul className="mt-6 divide-y divide-[var(--ws-line)]">
                  {parsed.map((item) => (
                    <li key={item.id} className="flex items-center gap-4 py-3">
                      <span className="min-w-0 flex-1 text-[15px] text-[var(--ws-ink)]">{item.text}</span>
                      <button
                        type="button"
                        onClick={() => toggleParsed(item.id)}
                        aria-label={`删除：${item.text}`}
                        className="shrink-0 rounded-full p-1.5 text-[var(--ws-miss)] transition-colors hover:bg-[var(--ws-ghost)]"
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
                {parsed.length === 0 && (
                  <p className="mt-4 text-[13px] text-[var(--ws-muted)]">
                    条目已全部删除。可以返回上一步重新导入，或直接继续。
                  </p>
                )}
              </>
            )}
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="s3">
            <h2 id="s3" className="text-[22px] font-semibold tracking-tight text-[var(--ws-ink)]">
              选择要深挖的代表项目
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--ws-ink-2)]">
              先挑一两个最有把握的。项目深挖会围绕它们逐个展开，结论不足五条的项目算力不够。
            </p>

            <ul className="mt-7 flex flex-col gap-3">
              {CANDIDATE_PROJECTS.map((name) => {
                const active = picked.includes(name)
                return (
                  <li key={name}>
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleProject(name)}
                        className="size-4 rounded border-[var(--ws-ghost-line)] bg-[var(--ws-ghost)] accent-[var(--ws-sand)]"
                      />
                      <span className="text-[15px] text-[var(--ws-ink)]">{name}</span>
                    </label>
                  </li>
                )
              })}
            </ul>

            <p className="mt-6 text-[13px] text-[var(--ws-muted)]">已选 {picked.length} 个</p>
          </section>
        )}
      </div>

      {/* ============ 导航 ============ */}
      <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-[var(--ws-line)] pt-6">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 0}
          className="rounded-full border border-[var(--ws-ghost-line)] px-5 py-2.5 text-[15px] text-[var(--ws-ink-2)] transition-colors hover:text-[var(--ws-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ws-sand)] disabled:pointer-events-none disabled:opacity-40"
        >
          上一步
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="group inline-flex items-center gap-1.5 rounded-full bg-[var(--ws-sand-fill)] px-5 py-2.5 text-[15px] font-medium text-[var(--ws-on-sand)] transition-transform hover:scale-[1.02]"
          >
            下一步
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="group inline-flex items-center gap-1.5 rounded-full bg-[var(--ws-sand-fill)] px-5 py-2.5 text-[15px] font-medium text-[var(--ws-on-sand)] transition-transform hover:scale-[1.02]"
          >
            进入工作台
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        )}

        <button
          type="button"
          onClick={() => setAskSkip(true)}
          className="ml-auto text-[14px] text-[var(--ws-muted)] transition-colors hover:text-[var(--ws-ink)]"
        >
          跳过引导
        </button>
      </div>

      {/* 跳过的后果必须说清楚，确认了才放行 */}
      {askSkip && (
        <div
          role="alertdialog"
          aria-labelledby="skip-title"
          className="mt-5 rounded-xl border border-[var(--ws-warn)] bg-[var(--ws-panel)] px-5 py-4 backdrop-blur-md"
        >
          <p id="skip-title" className="text-[14px] font-medium text-[var(--ws-warn)]">
            跳过之后不会生成差距报告
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--ws-ink-2)]">
            差距分析要靠目标岗位 + 项目证据才能算。跳过引导就等于这两个都没有，
            工作台里的「职业差距分析」会一直是空的，直到你补齐为止。
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="rounded-full bg-[var(--ws-warn)] px-4 py-1.5 text-[13px] font-medium text-[var(--ws-on-sand)]"
            >
              仍要跳过
            </button>
            <button
              type="button"
              onClick={() => setAskSkip(false)}
              className="rounded-full border border-[var(--ws-ghost-line)] px-4 py-1.5 text-[13px] text-[var(--ws-ink-2)] transition-colors hover:text-[var(--ws-ink)]"
            >
              继续引导
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
