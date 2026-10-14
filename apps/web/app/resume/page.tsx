import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, FileText, Plus, Upload } from 'lucide-react'
import { AppShell } from '@/components/app/app-shell'
import { EmptyState } from '@/components/shared/empty-state'
import { EvidenceStatusCount } from '@/components/shared/evidence-status'
import { SourcePopover } from '@/components/shared/source-popover'
import { PixelRule, TickStrip } from '@/components/ui/pixel'
import { EVIDENCE_STATUS_ORDER, statusCounts } from '@zhitu/types'
import { readDemoState } from '@/lib/demo-state'
import { EDUCATION, PROJECTS, RESUME_VERSIONS, SKILLS } from '@/lib/mock-data'
import { cardsOfProject } from '@/lib/session-seed'
import { KineticTitle } from '@/components/ui/kinetic-title'
import { ResumeAnalysisStudio } from '@/components/resume/resume-analysis-studio'

export const metadata: Metadata = { title: '简历分析 · 证途' }

const NAV_LABEL = '简历分析'

export default async function ResumePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const demo = readDemoState(await searchParams)
  const isEmpty = demo === 'empty'

  return (
    <AppShell current={NAV_LABEL}>
      <main className="mx-auto max-w-5xl px-4 pb-28 pt-16 md:px-8 md:pt-24">
        <header>
          <KineticTitle text="简历分析" index="01" eyebrow="Résumé" />
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[var(--ws-ink-2)]">
            把简历贴进来或上传 PDF，左边是原文，右边是 AI 改写后的推荐版本 ——
            中间每一条问题都引用了原文作为依据，点开哪条，左右两侧就同步跳到对应的句子。
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/resume/import"
              className="group inline-flex items-center gap-2 rounded-full border border-[var(--ws-ghost-line)] px-5 py-2.5 text-[15px] text-[var(--ws-ink-2)] transition-colors hover:border-[var(--ws-ghost-line-strong)] hover:text-[var(--ws-ink)]"
            >
              <Upload className="size-4" aria-hidden="true" />
              逐条核对导入
            </Link>
            <Link
              href="/resume/tailor"
              className="group inline-flex items-center gap-1.5 rounded-full border border-[var(--ws-ghost-line)] px-5 py-2.5 text-[15px] text-[var(--ws-ink-2)] transition-colors hover:border-[var(--ws-ghost-line-strong)] hover:text-[var(--ws-ink)]"
            >
              生成岗位专版
              <ArrowUpRight
                className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </header>

        {isEmpty ? (
          <EmptyState
            className="mt-14"
            what="还没有任何资产 —— 简历、项目、技能都还是空的"
            why="整套准备都建立在这份底料上：没有简历就没有可解析的项目，没有项目就没有可追问的证据，差距分析也就无从算起。"
            action={{ label: '导入简历', href: '/resume/import' }}
          />
        ) : (
          <>
            <ResumeAnalysisStudio />
            <PixelRule className="mt-16" />
            <ResumeBlock />
            <PixelRule className="mt-16" />
            <ProjectBlock />
            <PixelRule className="mt-16" />
            <SkillBlock />
            <PixelRule className="mt-16" />
            <EducationBlock />
          </>
        )}

        <div className="mt-20 flex items-end gap-6">
          <TickStrip count={56} seed={5} className="flex-1 overflow-hidden" />
          <Link
            href="/dashboard"
            className="shrink-0 text-[14px] text-[var(--ws-muted)] transition-colors hover:text-[var(--ws-ink)]"
          >
            工作台
          </Link>
        </div>
      </main>
    </AppShell>
  )
}

/* ============ 简历 ============ */

function ResumeBlock() {
  const latest = RESUME_VERSIONS[RESUME_VERSIONS.length - 1]

  return (
    <section aria-labelledby="resume-title" className="mt-16">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="resume-title" className="text-[26px] font-semibold tracking-tight text-[var(--ws-ink)]">
          简历
        </h2>
        <Link
          href="/resume/import"
          className="text-[13px] text-[var(--ws-sand)] transition-opacity hover:opacity-70"
        >
          重新导入
        </Link>
      </div>

      <div className="ws-ghost-box mt-7 px-6 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[16px] font-medium text-[var(--ws-ink)]">
              <FileText className="size-4 shrink-0" aria-hidden="true" />
              基础简历
            </p>
            <p className="mt-2 text-[13px] text-[var(--ws-muted)]">
              解析得到 {SKILLS.length} 项技能 · {PROJECTS.length} 个项目 · {EDUCATION.length} 条教育经历
            </p>
          </div>
          <p className="shrink-0 text-[12px] text-[var(--ws-muted)]">
            导入时间 {latest ? latest.createdAt : '—'}
          </p>
        </div>

        <PixelRule className="mt-6" />

        <p className="mt-5 text-[13px] text-[var(--ws-muted)]">岗位专版</p>
        <ul className="mt-3 flex flex-col gap-3">
          {RESUME_VERSIONS.map((v) => (
            <li key={v.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span className="text-[14px] text-[var(--ws-ink)]">
                v{v.version} · {v.targetTitle}
              </span>
              <span className="text-[12px] tabular-nums text-[var(--ws-muted)]">
                {v.createdAt} · {v.entries} 条
              </span>
            </li>
          ))}
        </ul>

        <Link
          href="/resume/tailor"
          className="group mt-5 inline-flex items-center gap-1.5 text-[14px] text-[var(--ws-sand)] transition-opacity hover:opacity-70"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          为目标岗位生成新版本
        </Link>
      </div>
    </section>
  )
}

/* ============ 项目 ============ */

function ProjectBlock() {
  return (
    <section aria-labelledby="projects-title" className="mt-14">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="projects-title" className="text-[26px] font-semibold tracking-tight text-[var(--ws-ink)]">
          项目
        </h2>
        <Link href="/projects" className="text-[13px] text-[var(--ws-sand)] transition-opacity hover:opacity-70">
          全部项目
        </Link>
      </div>

      <ul className="mt-7 divide-y divide-[var(--ws-line)]">
        {PROJECTS.map((p) => {
          const counts = statusCounts(cardsOfProject(p.id))
          return (
            <li key={p.id} className="py-6 first:pt-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <Link
                  href={`/projects/${p.id}`}
                  className="text-[18px] font-medium text-[var(--ws-ink)] transition-opacity hover:opacity-80"
                >
                  {p.name}
                </Link>
                <span className="text-[12px] text-[var(--ws-muted)]">
                  {p.role} · {p.period}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                {EVIDENCE_STATUS_ORDER.map((s) => (
                  <EvidenceStatusCount key={s} status={s} count={counts[s]} />
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Link
                  href={`/projects/${p.id}/start`}
                  className="group inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--ws-sand)] transition-opacity hover:opacity-70"
                >
                  {p.completedRounds > 0 ? '继续深挖' : '开始深挖'}
                  <ArrowUpRight
                    className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </Link>
                <span className="text-[12px] text-[var(--ws-muted)]">
                  {p.materials.length > 0 ? `${p.materials.length} 份材料已提交` : '暂无证据材料 · 纯追问验证'}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/* ============ 技能 ============ */

function SkillBlock() {
  return (
    <section aria-labelledby="skills-title" className="mt-14">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="skills-title" className="text-[26px] font-semibold tracking-tight text-[var(--ws-ink)]">
          技能清单
        </h2>
        <span className="text-[13px] text-[var(--ws-muted)]">每一项都标了来源</span>
      </div>

      <ul className="mt-7 divide-y divide-[var(--ws-line)]">
        {SKILLS.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4 first:pt-0">
            <span className="w-40 shrink-0 text-[15px] text-[var(--ws-ink)]">{s.name}</span>
            <SourcePopover source={s.source} />
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ============ 教育经历 ============ */

function EducationBlock() {
  return (
    <section aria-labelledby="edu-title" className="mt-14">
      <h2 id="edu-title" className="text-[26px] font-semibold tracking-tight text-[var(--ws-ink)]">
        教育经历
      </h2>

      <ul className="mt-7 flex flex-col gap-6">
        {EDUCATION.map((e) => (
          <li key={e.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="text-[16px] font-medium text-[var(--ws-ink)]">
                {e.school} · {e.major}
              </p>
              <span className="text-[12px] tabular-nums text-[var(--ws-muted)]">{e.period}</span>
            </div>
            <p className="mt-1.5 text-[13px] text-[var(--ws-ink-2)]">
              {e.degree} · {e.note}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
