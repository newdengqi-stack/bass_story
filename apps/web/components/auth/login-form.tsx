'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AFTER_LOGIN, DEMO_EMAIL, DEMO_PASSWORD, matchesDemoAccount } from '@/lib/demo-auth'

// 无卡片：表单直接落在照片上，字段只用一条底线 —— 照片在字段之间完整裸露
export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fillDemo = () => {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    setError('')
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('请填写邮箱和密码')
      return
    }

    setError('')
    setSubmitting(true)
    // 本地演示：校验演示账号后直接进入工作台。
    // 提示不区分原因 —— 不透露该邮箱是否已注册。
    setTimeout(() => {
      if (matchesDemoAccount(email, password)) {
        router.push(AFTER_LOGIN)
        return
      }
      setSubmitting(false)
      setError('邮箱或密码不正确')
    }, 600)
  }

  // 字段风格：透明底 + 仅底边线；文字带投影保证压在照片上也读得清
  const field =
    'w-full border-0 border-b bg-transparent py-3 text-lg text-white placeholder-white/40 outline-none transition-colors drop-shadow-[0_2px_10px_rgb(0_0_0/0.7)]'

  return (
    <div className="animate-fade-up w-full max-w-sm text-white">
      <h2 className="font-serif text-3xl font-semibold drop-shadow-[0_3px_16px_rgb(0_0_0/0.6)]">登录账号</h2>
      <p className="mt-2 text-sm text-white/80 drop-shadow-[0_2px_10px_rgb(0_0_0/0.65)]">
        继续你的证据化求职准备。
      </p>

      {/* 演示账号：本项目尚未接入后端，登录用这把钥匙走通流程 */}
      <div className="mt-7 rounded-xl border border-white/25 bg-white/10 px-4 py-3 backdrop-blur-sm">
        <p className="text-xs uppercase tracking-[0.18em] text-white/70 drop-shadow-[0_2px_8px_rgb(0_0_0/0.7)]">
          演示账号
        </p>
        <p className="mt-2 font-mono text-[13px] text-white drop-shadow-[0_2px_8px_rgb(0_0_0/0.7)]">
          {DEMO_EMAIL}
          <span className="mx-2 text-white/40">/</span>
          {DEMO_PASSWORD}
        </p>
        <button
          type="button"
          onClick={fillDemo}
          className="mt-3 rounded-full border border-white/30 px-3 py-1 text-xs text-white/80 transition-colors hover:border-[#e9c9a8] hover:text-[#e9c9a8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e9c9a8]"
        >
          一键填入
        </button>
      </div>

      <form className="mt-8 flex flex-col gap-6" onSubmit={submit} noValidate>
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-xs uppercase tracking-[0.18em] text-white/70 drop-shadow-[0_2px_8px_rgb(0_0_0/0.7)]"
          >
            邮箱
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={cn(
              field,
              'border-white/40 focus:border-[#e9c9a8]',
              error && 'border-[#fda4af] focus:border-[#fda4af]',
            )}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-xs uppercase tracking-[0.18em] text-white/70 drop-shadow-[0_2px_8px_rgb(0_0_0/0.7)]"
          >
            密码
          </label>
          <div className="relative">
            <input
              id="password"
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={cn(
                field,
                'border-white/40 pr-10 focus:border-[#e9c9a8]',
                error && 'border-[#fda4af] focus:border-[#fda4af]',
              )}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-0 top-1/2 -translate-y-1/2 rounded-lg p-2 text-white/60 transition-colors hover:text-white"
              aria-label={show ? '隐藏密码' : '显示密码'}
            >
              {show ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-[#fda4af] drop-shadow-[0_2px_8px_rgb(0_0_0/0.7)]" role="alert">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-white/80 drop-shadow-[0_2px_8px_rgb(0_0_0/0.7)]">
            <input type="checkbox" className="size-4 rounded border-white/40 bg-white/10 accent-[#e9c9a8]" />
            记住我
          </label>
          <a
            href="#"
            className="text-[#e9c9a8] underline underline-offset-4 drop-shadow-[0_2px_8px_rgb(0_0_0/0.7)] transition-colors hover:text-white"
          >
            忘记密码？
          </a>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="group mt-1 flex items-center justify-center gap-2 rounded-full bg-white py-3.5 font-medium text-[#2a2140] shadow-xl shadow-black/30 transition-transform hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-70"
        >
          {submitting ? '登录中…' : '登录'}
          {!submitting && (
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          )}
        </button>
      </form>

      <p className="mt-7 text-sm text-white/75 drop-shadow-[0_2px_8px_rgb(0_0_0/0.7)]">
        还没有账号？{' '}
        <Link href="/register" className="text-[#e9c9a8] underline underline-offset-4 transition-colors hover:text-white">
          注册
        </Link>
      </p>
    </div>
  )
}
