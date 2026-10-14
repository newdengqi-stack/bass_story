import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { AppShell } from '@/components/app/app-shell'
import { ProjectProfile } from '@/components/projects/project-profile'
import { EvidenceStatusCount } from '@/components/shared/evidence-status'
import { PixelRule } from '@/components/ui/pixel'
import { EVIDENCE_STATUS_ORDER, statusCounts } from '@zhitu/types'
import { findProject } from '@/lib/mock-data'
import { cardsOfProject } from '@/lib/session-seed'
import { KineticTitle } from '@/components/ui/kinetic-title'

export const metadata: Metadata = { title: '项目档案 · 证途' }

/** Next 16：params 是 Promise，必须 await */
export default async function ProjectProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = findProject(id)
  if (!project) notFound()

  const counts = statusCounts(cardsOfProject(project.id))

  return (
    <AppShell current="我的简历">
      <main className="mx-auto max-w-3xl px-4 pb-28 pt-16 md:px-8 md:pt-24">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-[13px] text-[var(--ws-muted)] transition-colors hover:text-[var(--ws-ink)]"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          项目深挖
        </Link>

        <KineticTitle text={project.name} index="03 · i" eyebrow="Project Profile" className="mt-6" />
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-[var(--ws-ink-2)]">
          先把底料摆清楚：项目是什么、你做了什么、有什么能拿出来看。这些都会成为追问的起点。
        </p>

        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2">
          {EVIDENCE_STATUS_ORDER.map((s) => (
            <EvidenceStatusCount key={s} status={s} count={counts[s]} />
          ))}
        </div>

        <PixelRule className="mt-8" />

        <ProjectProfile project={project} />
      </main>
    </AppShell>
  )
}
