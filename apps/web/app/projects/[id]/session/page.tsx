import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { AppShell } from '@/components/app/app-shell'
import { DigSession } from '@/components/projects/dig-session'
import { findProject, TARGET } from '@/lib/mock-data'

export const metadata: Metadata = { title: '追问会话 · 证途' }

/** Next 16：params 是 Promise，必须 await */
export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = findProject(id)
  if (!project) notFound()

  return (
    <AppShell current="项目深挖">
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-14 md:px-8 md:pt-20">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <Link
            href={`/projects/${project.id}/start`}
            className="inline-flex items-center gap-1.5 text-[13px] text-[var(--ws-muted)] transition-colors hover:text-[var(--ws-ink)]"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            {project.name} · 深挖说明
          </Link>
          <span className="text-[12px] text-[var(--ws-muted)]">
            目标岗位 · {TARGET.title}
          </span>
        </div>

        <DigSession project={project} target={TARGET} />
      </main>
    </AppShell>
  )
}
