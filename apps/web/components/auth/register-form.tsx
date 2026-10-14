'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AFTER_REGISTER, DEMO_EMAIL } from '@/lib/demo-auth'

const MIN_PASSWORD = 8

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type Errors = Partial<Record<'email' | 'password' | 'confirm' | 'terms', string>>

/**
 * 注册表单 —— 与登录页共用同一套字段形态：透明底 + 仅底边线，文字带投影。
 */
export function RegisterForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [show, setShow] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)

  // 字段：透明底 + 仅底边线；focus-visible 用沙金描边，键盘用户也能看到落点
  const field =
    'w-full border-0 border-b bg-transparent py-3 text-lg text-white placeholder-white/40 outline-none transition-colors drop-shadow-[0_2px_10px_rgb(0_0_0/0.7)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e9c9a8]'

  const labelCls =
    'mb-1 block text-xs uppercase tracking-[0.18em] text-white/70 drop-shadow-[0_2px_8px_rgb(0_0_0/0.7)]'

  const canSubmit = accepted && !submitting

  const validate = (): Errors => {
    const next: Errors = {}
    if (!EMAIL_RE.test(email.trim())) next.email = '请输入有效的邮箱地址'
    if (password.length < MIN_PASSWORD) next.password = `密码至少 ${MIN_PASSWORD} 位`
    if (confirm !== password) next.confirm = '两次输入的密码不一致'
    if (!accepted) next.terms = '需要同意服务条款与隐私政策才能注册'
    return next
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    // 本地演示：不接后端。唯一会「失败」的情况是邮箱已被演示账号占用。
    // 提示刻意不区分原因 —— 只说没成功，不说是因为这个邮箱已存在。
    setTimeout(() => {
      if (email.trim().toLowerCase() === DEMO_EMAIL) {
        setSubmitting(false)
        setErrors({ email: '注册没有成功，请稍后重试' })
        return
      }
      router.push(AFTER_REGISTER)
    }, 900)
  }

  return (
    <div className="animate-fade-up w-full max-w-sm text-white">
      <h2 className="font-serif text-3xl font-semibold drop-shadow-[0_3px_16px_rgb(0_0_0/0.6)]">创建账号</h2>
      <p className="mt-2 text-sm text-white/80 drop-shadow-[0_2px_10px_rgb(0_0_0/0.65)]">
        从一份具体的目标岗位开始，把准备变成可核验的证据。
      </p>

      <form className="mt-9 flex flex-col gap-6" onSubmit={submit} noValidate>
        <div>
          <label htmlFor="reg-email" className={labelCls}>
            邮箱
          </label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-invalid={errors.email ? true : undefined}
            className={cn(field, 'border-white/40 focus:border-[#e9c9a8]', errors.email && 'border-[#fda4af]')}
          />
          {errors.email && (
            <p role="alert" className="mt-2 text-sm text-[#fda4af] drop-shadow-[0_2px_8px_rgb(0_0_0/0.7)]">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="reg-password" className={labelCls}>
            密码
          </label>
          <div className="relative">
            <input
              id="reg-password"
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={`至少 ${MIN_PASSWORD} 位`}
              aria-invalid={errors.password ? true : undefined}
              className={cn(
                field,
                'border-white/40 pr-10 focus:border-[#e9c9a8]',
                errors.password && 'border-[#fda4af]',
              )}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-0 top-1/2 -translate-y-1/2 rounded-lg p-2 text-white/60 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e9c9a8]"
              aria-label={show ? '隐藏密码' : '显示密码'}
            >
              {show ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
            </button>
          </div>
          {errors.password && (
            <p role="alert" className="mt-2 text-sm text-[#fda4af] drop-shadow-[0_2px_8px_rgb(0_0_0/0.7)]">
              {errors.password}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="reg-confirm" className={labelCls}>
            确认密码
          </label>
          <input
            id="reg-confirm"
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="再输入一次"
            aria-invalid={errors.confirm ? true : undefined}
            className={cn(field, 'border-white/40 focus:border-[#e9c9a8]', errors.confirm && 'border-[#fda4af]')}
          />
          {errors.confirm && (
            <p role="alert" className="mt-2 text-sm text-[#fda4af] drop-shadow-[0_2px_8px_rgb(0_0_0/0.7)]">
              {errors.confirm}
            </p>
          )}
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-2 text-sm text-white/80 drop-shadow-[0_2px_8px_rgb(0_0_0/0.7)]">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => {
                setAccepted(e.target.checked)
                if (e.target.checked) setErrors((prev) => ({ ...prev, terms: undefined }))
              }}
              className="mt-0.5 size-4 shrink-0 rounded border-white/40 bg-white/10 accent-[#e9c9a8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e9c9a8]"
              aria-required="true"
            />
            <span>我已阅读并同意《服务条款》与《隐私政策》</span>
          </label>
          {errors.terms && (
            <p role="alert" className="mt-2 text-sm text-[#fda4af] drop-shadow-[0_2px_8px_rgb(0_0_0/0.7)]">
              {errors.terms}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="group mt-1 flex items-center justify-center gap-2 rounded-full bg-white py-3.5 font-medium text-[#2a2140] shadow-xl shadow-black/30 transition-transform hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e9c9a8] disabled:pointer-events-none disabled:opacity-40"
        >
          {submitting ? '创建中…' : '创建账号'}
          {!submitting && (
            <ArrowUpRight
              className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          )}
        </button>

        {!accepted && (
          <p className="-mt-3 text-xs text-white/60 drop-shadow-[0_2px_8px_rgb(0_0_0/0.7)]">
            勾选同意条款后才能创建账号
          </p>
        )}
      </form>

      <p className="mt-7 text-sm text-white/75 drop-shadow-[0_2px_8px_rgb(0_0_0/0.7)]">
        已经有账号了？{' '}
        <Link href="/login" className="text-[#e9c9a8] underline underline-offset-4 transition-colors hover:text-white">
          登录
        </Link>
      </p>
    </div>
  )
}
