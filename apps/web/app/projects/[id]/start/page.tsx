import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, Info, SkipForward } from 'lucide-react'
import { AppShell } from '@/components/app/app-shell'
import { StepIndicator } from '@/components/shared/step-indicator'
import { PixelRule } from '@/components/ui/pixel'
import { DIMENSIONS, MATERIAL_KIND_LABEL, MIN_EVIDENCE_COUNT } from '@zhitu/types'
import { findProject, TARGET } from '@/lib/mock-data'
import { roundsOfProject } from '@/lib/session-seed'
import { KineticTitle } from '@/components/ui/kinetic-title'

export const metadata: Metadata = { title: '开始深挖 · 证途' }

const RULES = [
  { title: '一次只问一个问题', detail: '会话里任何时刻只有一个问题在屏幕上，你可以专心把这一条讲透。' },
  { title: '答不上来可以跳过', detail: '跳过的那一轮不会被计入证据，也不会留下任何记录，直接进到下一题。' },
  { title: '可以声明「未做过」', detail: '直接说没做过就行。系统会如实记下这件事，不会把它写成对你的评价。' },
  { title: '每条结论都会标注来源', detail: '结论会指向具体的第几轮追问或哪一份材料，你随时可以展开核对。' },
]

/** Next 16：params 是 Promise，必须 await */
export default async function StartDigPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = findProject(id)
  if (!project) notFound()

  const roundsDone = roundsOfProject(project.id).length
  const hasMaterials = project.materials.length > 0

  return (
    <AppShell current="项目深挖">
      <main className="mx-auto max-w-4xl px-4 pb-28 pt-16 md:px-8 md:pt-24">
        <Link
          href={`/projects/${project.id}`}
          className="inline-flex items-center gap-1.5 text-[13px] text-[var(--ws-muted)] transition-colors hover:text-[var(--ws-ink)]"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          {project.name} · 项目档案
        </Link>

        <KineticTitle text="开始深挖" index="03 · ii" eyebrow="Begin the Dig" className="mt-6" />
        <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[var(--ws-ink-2)]">
          接下来会围绕这个项目连续追问。目的是判断哪些部分你能从头讲到尾 ——
          讲得清楚的能力会拿到「已验证」，讲不清的会被标出来，好过在面试里被问到。
        </p>

        <StepIndicator
          className="mt-10 max-w-md"
          steps={['建目标岗位', '导入简历', '项目深挖', '差距分析']}
          current={2}
          ariaLabel="准备闭环进度"
        />

        <PixelRule className="mt-12" />

        {/* ============ 上下文 ============ */}
        <section aria-labelledby="ctx-title" className="mt-12">
          <h2 id="ctx-title" className="text-[20px] font-semibold tracking-tight text-[var(--ws-ink)]">
            本次验证的上下文
          </h2>

          <dl className="mt-6 grid gap-x-10 gap-y-5 sm:grid-cols-2">
            <div>
              <dt className="text-[13px] text-[var(--ws-muted)]">项目</dt>
              <dd className="mt-1 text-[16px] text-[var(--ws-ink)]">{project.name}</dd>
            </div>
            <div>
              <dt className="text-[13px] text-[var(--ws-muted)]">个人角色</dt>
              <dd className="mt-1 text-[16px] text-[var(--ws-ink)]">{project.role}</dd>
            </div>
            <div>
              <dt className="text-[13px] text-[var(--ws-muted)]">当前主目标岗位</dt>
              <dd className="mt-1 text-[16px] text-[var(--ws-ink)]">
                {TARGET.title} · {TARGET.company}
              </dd>
            </div>
            <div>
              <dt className="text-[13px] text-[var(--ws-muted)]">已进行轮次</dt>
              <dd className="mt-1 text-[16px] tabular-nums text-[var(--ws-ink)]">
                {roundsDone > 0 ? `${roundsDone} 轮` : '尚未开始'}
              </dd>
            </div>
          </dl>

          <div className="mt-7">
            <p className="text-[13px] text-[var(--ws-muted)]">已提交的证据材料</p>
            {hasMaterials ? (
              <ul className="mt-3 flex flex-col gap-2">
                {project.materials.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-baseline gap-x-3 text-[15px] text-[var(--ws-ink)]">
                    <span>{m.label}</span>
                    <span className="text-[12px] text-[var(--ws-muted)]">{MATERIAL_KIND_LABEL[m.kind]}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p
                role="note"
                className="ws-ghost-box mt-3 flex items-start gap-3 px-5 py-4 text-[14px] leading-relaxed text-[var(--ws-ink-2)]"
              >
                <Info className="mt-0.5 size-4 shrink-0 text-[var(--ws-sand)]" aria-hidden="true" />
                <span>
                  这个项目没有提交任何材料，本次将进行
                  <span className="text-[var(--ws-ink)]">纯追问验证</span>。
                  结论只能来自你的回答 —— 没有材料也不会被默认判定为「已验证」，
                  答不上来的部分同样不会被补写。
                </span>
              </p>
            )}
          </div>
        </section>

        <PixelRule className="mt-14" />

        {/* ============ 九个维度 ============ */}
        <section aria-labelledby="dim-title" className="mt-14">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="dim-title" className="text-[20px] font-semibold tracking-tight text-[var(--ws-ink)]">
              会覆盖的九个维度
            </h2>
            <span className="text-[13px] text-[var(--ws-muted)]">共 {DIMENSIONS.length} 项</span>
          </div>

          <ol className="mt-7 grid gap-x-10 gap-y-5 sm:grid-cols-2">
            {DIMENSIONS.map((d, i) => (
              <li key={d.id} className="flex gap-4">
                <span className="mt-[3px] shrink-0 font-mono text-[13px] tabular-nums text-[var(--ws-sand)]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-medium text-[var(--ws-ink)]">{d.name}</span>
                  <span className="mt-1 block text-[13px] leading-relaxed text-[var(--ws-muted)]">
                    {d.question}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <PixelRule className="mt-14" />

        {/* ============ 会话规则 ============ */}
        <section aria-labelledby="rule-title" className="mt-14">
          <h2 id="rule-title" className="text-[20px] font-semibold tracking-tight text-[var(--ws-ink)]">
            会话规则
          </h2>

          <ul className="mt-7 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {RULES.map((r) => (
              <li key={r.title}>
                <p className="flex items-center gap-2 text-[15px] font-medium text-[var(--ws-ink)]">
                  {r.title === '答不上来可以跳过' && (
                    <SkipForward className="size-3.5 shrink-0 text-[var(--ws-sand)]" aria-hidden="true" />
                  )}
                  {r.title}
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--ws-ink-2)]">{r.detail}</p>
              </li>
            ))}
          </ul>

          {/* 完成条件 —— 只说条数，不承诺时长（规格 P10 明确要求） */}
          <div className="ws-ghost-box mt-8 px-6 py-5">
            <p className="text-[15px] font-medium text-[var(--ws-ink)]">完成条件</p>
            <p className="mt-2 text-[14px] leading-relaxed text-[var(--ws-ink-2)]">
              至少形成 <span className="tabular-nums text-[var(--ws-ink)]">{MIN_EVIDENCE_COUNT} 条</span>
              有来源的证据或缺口。达到之后你可以随时结束，也可以继续把剩下的维度问完。
            </p>
            <p className="mt-2 text-[13px] text-[var(--ws-muted)]">
              不设时长 —— 答得快不代表证据够，问到能讲清楚为止。
            </p>
          </div>
        </section>

        <div className="mt-14 flex flex-wrap items-center gap-5 border-t border-[var(--ws-line)] pt-6">
          <Link
            href={`/projects/${project.id}/session`}
            className="group inline-flex items-center gap-2 rounded-full bg-[var(--ws-sand-fill)] px-5 py-2.5 text-[15px] font-medium text-[var(--ws-on-sand)] transition-transform hover:scale-[1.02]"
          >
            {roundsDone > 0 ? `继续追问（已完成 ${roundsDone} 轮）` : '开始追问'}
            <ArrowUpRight
              className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </Link>
          <Link
            href={`/projects/${project.id}`}
            className="text-[14px] text-[var(--ws-muted)] transition-colors hover:text-[var(--ws-ink)]"
          >
            先去补充材料
          </Link>
        </div>
      </main>
    </AppShell>
  )
}
