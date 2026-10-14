'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Download, KeyRound, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PixelRule } from '@/components/ui/pixel'
import { EDUCATION, TARGET } from '@/lib/mock-data'

const inputCls =
  'w-full rounded-xl border border-[var(--ws-ghost-line)] bg-[var(--ws-field)] px-4 py-3 text-[15px] text-[var(--ws-ink)] placeholder-[var(--ws-muted)] outline-none transition-colors focus:border-[var(--ws-sand)] focus:bg-[var(--ws-ghost)]'

/** 删除账户需要逐字输入这句确认文本，输错就不放行 */
const DELETE_PHRASE = '删除我的账号'

export function SettingsPanels() {
  const [name, setName] = useState('张明')
  const [email, setEmail] = useState('zhangming@example.com')
  const [notice, setNotice] = useState<string | null>(null)
  const [confirmText, setConfirmText] = useState('')

  const deleteReady = confirmText.trim() === DELETE_PHRASE

  return (
    <div className="ws-glass-card mt-10 rounded-[28px] px-6 py-10 sm:px-10">
      {/* ============ 基本信息 ============ */}
      <section aria-labelledby="basic-title">
        <h2 id="basic-title" className="text-[22px] font-semibold tracking-tight text-[var(--ws-ink)]">
          基本信息
        </h2>
        <p className="mt-2 text-[13px] text-[var(--ws-muted)]">用于简历与报告抬头，不影响岗位匹配</p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="s-name" className="mb-2 block text-[13px] text-[var(--ws-ink-2)]">
              姓名
            </label>
            <input id="s-name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="s-email" className="mb-2 block text-[13px] text-[var(--ws-ink-2)]">
              邮箱
            </label>
            <input
              id="s-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <dl className="mt-7 flex flex-wrap gap-x-10 gap-y-4">
          <div>
            <dt className="text-[13px] text-[var(--ws-muted)]">当前主目标岗位</dt>
            <dd className="mt-1 text-[15px] text-[var(--ws-ink)]">
              {TARGET.title} · {TARGET.company}
            </dd>
          </div>
          <div>
            <dt className="text-[13px] text-[var(--ws-muted)]">教育经历</dt>
            <dd className="mt-1 text-[15px] text-[var(--ws-ink)]">
              {EDUCATION[0]?.school} · {EDUCATION[0]?.major}
            </dd>
          </div>
        </dl>

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setNotice('基本信息已保存（本地演示，刷新不保留）')}
            className="rounded-full bg-[var(--ws-sand-fill)] px-5 py-2.5 text-[15px] font-medium text-[var(--ws-on-sand)] transition-transform hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ws-ink)]"
          >
            保存
          </button>
          <Link
            href="/projects"
            className="text-[14px] text-[var(--ws-muted)] transition-colors hover:text-[var(--ws-ink)]"
          >
            切换主目标岗位
          </Link>
        </div>
      </section>

      <PixelRule className="mt-14" />

      {/* ============ 登录与安全 ============ */}
      <section aria-labelledby="security-title" className="mt-14">
        <h2 id="security-title" className="text-[22px] font-semibold tracking-tight text-[var(--ws-ink)]">
          登录与安全
        </h2>

        <ul className="mt-6 divide-y divide-[var(--ws-line)]">
          <li className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4 first:pt-0">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-[15px] text-[var(--ws-ink)]">
                <KeyRound className="size-4 shrink-0" aria-hidden="true" />
                登录密码
              </p>
              <p className="mt-1 text-[13px] text-[var(--ws-muted)]">上次修改：2025-09-18</p>
            </div>
            <button
              type="button"
              onClick={() => setNotice('重置密码的邮件已发送（本地演示，不会真的发出）')}
              className="rounded-full border border-[var(--ws-ghost-line)] px-4 py-1.5 text-[13px] text-[var(--ws-ink-2)] transition-colors hover:border-[var(--ws-ghost-line-strong)] hover:text-[var(--ws-ink)]"
            >
              修改密码
            </button>
          </li>

          <li className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4">
            <div className="min-w-0">
              <p className="text-[15px] text-[var(--ws-ink)]">登录会话</p>
              <p className="mt-1 text-[13px] text-[var(--ws-muted)]">
                退出后需要重新登录；已形成的结论与项目证据不受影响
              </p>
            </div>
            <Link
              href="/login"
              className="rounded-full border border-[var(--ws-ghost-line)] px-4 py-1.5 text-[13px] text-[var(--ws-ink-2)] transition-colors hover:border-[var(--ws-ghost-line-strong)] hover:text-[var(--ws-ink)]"
            >
              退出登录
            </Link>
          </li>
        </ul>
      </section>

      <PixelRule className="mt-14" />

      {/* ============ 数据管理 ============ */}
      <section aria-labelledby="data-title" className="mt-14">
        <h2 id="data-title" className="text-[22px] font-semibold tracking-tight text-[var(--ws-ink)]">
          数据管理
        </h2>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-[var(--ws-line)] pt-6">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[15px] text-[var(--ws-ink)]">
              <Download className="size-4 shrink-0" aria-hidden="true" />
              导出我的数据
            </p>
            <p className="mt-1 text-[13px] text-[var(--ws-muted)]">
              包含简历、项目档案、全部结论及来源记录
            </p>
          </div>
          <button
            type="button"
            onClick={() => setNotice('导出任务已创建（本地演示，不会真的生成文件）')}
            className="rounded-full border border-[var(--ws-ghost-line)] px-4 py-1.5 text-[13px] text-[var(--ws-ink-2)] transition-colors hover:border-[var(--ws-ghost-line-strong)] hover:text-[var(--ws-ink)]"
          >
            导出
          </button>
        </div>

        <div className="mt-8 border-t border-[var(--ws-line)] pt-6">
          <p className="flex items-center gap-2 text-[15px] text-[var(--ws-miss)]">
            <Trash2 className="size-4 shrink-0" aria-hidden="true" />
            删除账户
          </p>
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-[var(--ws-ink-2)]">
            会一并删除简历、项目档案、全部结论与来源记录，且无法恢复。
            为了确认这是你本人的操作，请输入
            <span className="mx-1 text-[var(--ws-ink)]">{DELETE_PHRASE}</span>。
          </p>

          <label htmlFor="confirm-delete" className="mt-5 mb-2 block text-[13px] text-[var(--ws-ink-2)]">
            确认文本
          </label>
          <input
            id="confirm-delete"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={DELETE_PHRASE}
            className={cn(inputCls, 'max-w-md')}
          />

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button
              type="button"
              disabled={!deleteReady}
              className="rounded-full border border-[var(--ws-miss)] px-5 py-2 text-[14px] text-[var(--ws-miss)] transition-colors hover:bg-[var(--ws-miss-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ws-miss)] disabled:pointer-events-none disabled:opacity-40"
            >
              永久删除账户
            </button>
            {!deleteReady && (
              <span className="text-[13px] text-[var(--ws-muted)]">
                确认文本不一致，操作不可用
              </span>
            )}
          </div>
        </div>
      </section>

      {notice && (
        <p role="status" className="mt-10 text-[14px] text-[var(--ws-ok)]">
          {notice}
        </p>
      )}
    </div>
  )
}
