'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Info, Link2, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MATERIAL_KIND_LABEL, type EvidenceMaterial, type MaterialKind, type Project } from '@zhitu/types'

const inputCls =
  'w-full rounded-xl border border-[var(--ws-ghost-line)] bg-[var(--ws-field)] px-4 py-3 text-[15px] text-[var(--ws-ink)] placeholder-[var(--ws-muted)] outline-none transition-colors focus:border-[var(--ws-sand)] focus:bg-[var(--ws-ghost)]'

const ADDABLE: MaterialKind[] = ['link', 'doc', 'log']

/** 只接受 http/https 绝对地址 —— 空字符串视为「未填写」，不算错误 */
function linkError(href: string): string {
  const value = href.trim()
  if (!value) return ''
  let parsed: URL
  try {
    parsed = new URL(value)
  } catch {
    return '链接格式不对，需要以 http:// 或 https:// 开头'
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return '只支持 http:// 或 https:// 开头的链接'
  }
  return ''
}

export function ProjectProfile({ project }: { project: Project }) {
  const [name, setName] = useState(project.name)
  const [role, setRole] = useState(project.role)
  const [period, setPeriod] = useState(project.period)
  const [goal, setGoal] = useState(project.goal)
  const [tech, setTech] = useState(project.tech.join('、'))
  const [materials, setMaterials] = useState<EvidenceMaterial[]>(project.materials)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const [showContinueHint, setShowContinueHint] = useState(false)

  const nameMissing = name.trim().length === 0
  const hasInvalidLink = materials.some((m) => m.kind === 'link' && linkError(m.href) !== '')

  const patchMaterial = (id: string, patch: Partial<EvidenceMaterial>) => {
    setMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))
    // 就地校验：只影响这一条，不动其他字段
    if ('href' in patch) {
      const next = materials.find((m) => m.id === id)
      if (next) {
        const message = linkError(patch.href ?? '')
        setErrors((prev) => ({ ...prev, [id]: message }))
      }
    }
  }

  const addMaterial = (kind: MaterialKind) => {
    setMaterials((prev) => [
      ...prev,
      { id: `nm-${Date.now()}`, kind, label: '', href: '' },
    ])
  }

  const removeMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const onSave = () => {
    if (nameMissing || hasInvalidLink) return
    setSaved(true)
    setShowContinueHint(false)
  }

  return (
    <div className="mt-12">
      {/* ============ 基本信息 ============ */}
      <section aria-labelledby="basic-title">
        <h2 id="basic-title" className="text-[20px] font-semibold tracking-tight text-[var(--ws-ink)]">
          基本信息
        </h2>

        <div className="mt-6 flex flex-col gap-6">
          <div>
            <label htmlFor="p-name" className="mb-2 block text-[13px] text-[var(--ws-ink-2)]">
              项目名称 <span className="text-[var(--ws-sand)]">*</span>
            </label>
            <input
              id="p-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setSaved(false)
              }}
              placeholder="例：智能温控终端"
              aria-required="true"
              className={cn(inputCls, nameMissing && 'border-[var(--ws-miss)]')}
            />
            {nameMissing && (
              <p className="mt-2 text-[13px] text-[var(--ws-miss)]">项目名称为必填项，填好才能保存。</p>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="p-role" className="mb-2 block text-[13px] text-[var(--ws-ink-2)]">
                个人角色
              </label>
              <input
                id="p-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="例：固件开发"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="p-period" className="mb-2 block text-[13px] text-[var(--ws-ink-2)]">
                时间区间
              </label>
              <input
                id="p-period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="例：2025.03 – 2025.06"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label htmlFor="p-goal" className="mb-2 block text-[13px] text-[var(--ws-ink-2)]">
              项目目标
            </label>
            <textarea
              id="p-goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={3}
              placeholder="这个项目要解决什么问题？做成什么样算成功？"
              className={cn(inputCls, 'resize-y leading-relaxed')}
            />
          </div>

          <div>
            <label htmlFor="p-tech" className="mb-2 block text-[13px] text-[var(--ws-ink-2)]">
              技术关键词
            </label>
            <input
              id="p-tech"
              value={tech}
              onChange={(e) => setTech(e.target.value)}
              placeholder="用顿号分隔，例：STM32、FreeRTOS、PID"
              className={inputCls}
            />
          </div>
        </div>
      </section>

      {/* ============ 证据材料 ============ */}
      <section aria-labelledby="materials-title" className="mt-14">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="materials-title" className="text-[20px] font-semibold tracking-tight text-[var(--ws-ink)]">
            证据材料
          </h2>
          <span className="text-[13px] text-[var(--ws-muted)]">有材料会让追问更有的放矢，但不是必须的</span>
        </div>

        {materials.length === 0 ? (
          <p className="ws-ghost-box mt-5 flex items-start gap-3 px-5 py-4 text-[14px] leading-relaxed text-[var(--ws-ink-2)]">
            <Info className="mt-0.5 size-4 shrink-0 text-[var(--ws-sand)]" aria-hidden="true" />
            <span>
              这个项目还没有提交任何材料。没有材料也能继续 ——
              届时会以<span className="text-[var(--ws-ink)]">纯追问</span>的方式验证，
              每条结论都来自你的回答，不会凭空判定为「已验证」。
            </span>
          </p>
        ) : (
          <ul className="mt-5 flex flex-col gap-5">
            {materials.map((m) => {
              const message = errors[m.id] ?? ''
              return (
                <li key={m.id} className="border-t border-[var(--ws-line)] pt-5 first:border-t-0 first:pt-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full border border-[var(--ws-ghost-line)] px-2.5 py-0.5 text-[12px] text-[var(--ws-ink-2)]">
                      {MATERIAL_KIND_LABEL[m.kind]}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeMaterial(m.id)}
                      aria-label={`删除材料：${m.label || MATERIAL_KIND_LABEL[m.kind]}`}
                      className="rounded-full p-1.5 text-[var(--ws-miss)] transition-colors hover:bg-[var(--ws-ghost)]"
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-col gap-3">
                    <input
                      value={m.label}
                      onChange={(e) => patchMaterial(m.id, { label: e.target.value })}
                      placeholder="材料名称，例：模块设计文档 v1.2"
                      aria-label="材料名称"
                      className={inputCls}
                    />
                    <input
                      value={m.href}
                      onChange={(e) => patchMaterial(m.id, { href: e.target.value })}
                      placeholder="https://…（可留空）"
                      aria-label="材料链接"
                      aria-invalid={message ? true : undefined}
                      aria-describedby={message ? `err-${m.id}` : undefined}
                      className={cn(inputCls, message && 'border-[var(--ws-miss)]')}
                    />
                    {message && (
                      <p id={`err-${m.id}`} role="alert" className="text-[13px] text-[var(--ws-miss)]">
                        {message}
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {ADDABLE.map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => addMaterial(kind)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ws-ghost-line)] px-3.5 py-1.5 text-[13px] text-[var(--ws-ink-2)] transition-colors hover:border-[var(--ws-ghost-line-strong)] hover:text-[var(--ws-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ws-sand)]"
            >
              {kind === 'link' ? (
                <Link2 className="size-3.5" aria-hidden="true" />
              ) : (
                <Plus className="size-3.5" aria-hidden="true" />
              )}
              添加{MATERIAL_KIND_LABEL[kind]}
            </button>
          ))}
        </div>
      </section>

      {/* ============ 提交 ============ */}
      <div className="mt-14 flex flex-wrap items-center gap-4 border-t border-[var(--ws-line)] pt-6">
        <button
          type="button"
          onClick={onSave}
          disabled={nameMissing || hasInvalidLink}
          className="rounded-full bg-[var(--ws-sand-fill)] px-5 py-2.5 text-[15px] font-medium text-[var(--ws-on-sand)] transition-transform hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ws-ink)] disabled:pointer-events-none disabled:opacity-40"
        >
          保存项目档案
        </button>

        <button
          type="button"
          onClick={() => setShowContinueHint(true)}
          className="group inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--ws-sand)] transition-opacity hover:opacity-70"
        >
          进入深挖
          <ArrowUpRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </button>

        {saved && <span className="text-[13px] text-[var(--ws-ok)]">已保存（本地演示，刷新不保留）</span>}
        {hasInvalidLink && (
          <span className="text-[13px] text-[var(--ws-miss)]">有链接格式不对，修好后再保存</span>
        )}
      </div>

      {/* 未提交材料时的跳转前提示 —— 不阻断进入，但把话说明白 */}
      {showContinueHint && (
        <div
          role="alertdialog"
          aria-labelledby="continue-title"
          className="mt-5 rounded-xl border border-[var(--ws-line-2)] bg-[var(--ws-panel)] px-5 py-4 backdrop-blur-md"
        >
          <p id="continue-title" className="text-[14px] font-medium text-[var(--ws-ink)]">
            {materials.length === 0 ? '这个项目没有材料，将进行纯追问验证' : `将带着 ${materials.length} 份材料进入追问`}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--ws-ink-2)]">
            {materials.length === 0
              ? '结论只能来自你的回答。答不上来的问题会被如实记为「证据不足」或「当前缺失」，不会因为你没有材料就直接判定为已验证。'
              : '追问会围绕这些材料展开，也会问到材料没覆盖到的部分。'}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/projects/${project.id}/start`}
              className="rounded-full bg-[var(--ws-sand-fill)] px-4 py-1.5 text-[13px] font-medium text-[var(--ws-on-sand)]"
            >
              继续，进入深挖
            </Link>
            <button
              type="button"
              onClick={() => setShowContinueHint(false)}
              className="rounded-full border border-[var(--ws-ghost-line)] px-4 py-1.5 text-[13px] text-[var(--ws-ink-2)] transition-colors hover:text-[var(--ws-ink)]"
            >
              先补材料
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
