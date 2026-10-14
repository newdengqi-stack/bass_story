'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from '@/lib/navigation'
import {
  FileText,
  Upload,
  X,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Loader2,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { ActionBar } from '@/components/workbench/action-bar'
import { useFlow } from '@/lib/flow-context'
import { cn } from '@/lib/utils'

type UploadState =
  | 'empty'
  | 'file_selected'
  | 'parsing'
  | 'parse_failed'
  | 'invalid_file'

import { SAMPLE_TEXT } from '@/lib/api/fixtures'
import { analyzeResumeText, getAnalysisHealth } from '@/lib/resume-analysis'
import { uploadPolicy } from '@/lib/api/mock'
import { useAsync } from '@/lib/use-async'

export function UploadForm() {
  const router = useRouter()
  const {
    resumeFileName,
    setResumeFileName,
    resumeText,
    setResumeText,
    privacyConfirmed,
    setPrivacyConfirmed,
    setInitialReview,
  } = useFlow()
  const [state, setState] = useState<UploadState>(
    resumeFileName ? 'file_selected' : 'empty',
  )
  const operation = useAsync()
  const submitting = useRef(false)
  const [health, setHealth] = useState<{
    mode: 'mock' | 'dashscope' | 'deepseek'
    configured: boolean
  } | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    void getAnalysisHealth(controller.signal)
      .then(setHealth)
      .catch(() => {
        if (!controller.signal.aborted) setHealth(null)
      })
    return () => controller.abort()
  }, [])
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const hasContent = resumeText.trim().length > 0
  const canContinue =
    hasContent &&
    privacyConfirmed &&
    !operation.loading &&
    state !== 'invalid_file' &&
    resumeText.trim().length >= 20 &&
    resumeText.length <= 12000

  function handleFiles(files: FileList | null) {
    if (operation.loading) return
    const file = files?.[0]
    if (!file) return
    if (
      file.type !== uploadPolicy.mime ||
      !file.name.toLowerCase().endsWith('.pdf') ||
      file.size > uploadPolicy.maxBytes ||
      file.size === 0
    ) {
      operation.setError('请选择非空 PDF（上限 5 MB）；本轮分析仍需粘贴正文。')
      setResumeFileName(null)
      setState('invalid_file')
      return
    }
    operation.setError('')
    setResumeFileName(file.name)
    setState('file_selected')
  }

  function clearFile() {
    setResumeFileName(null)
    if (inputRef.current) inputRef.current.value = ''
    operation.setError('')
    setState('empty')
  }

  function fillSample() {
    setResumeText(SAMPLE_TEXT)
    setResumeFileName(null)
    setState('file_selected')
  }

  async function handleContinue() {
    if (!canContinue || submitting.current) return
    submitting.current = true
    setState('parsing')
    const result = await operation.run((signal) =>
      analyzeResumeText(resumeText, privacyConfirmed, signal),
    )
    submitting.current = false
    if (result) {
      setInitialReview(result)
      router.push('/review')
    } else setState('parse_failed')
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
      <div className="flex flex-col gap-5 lg:col-span-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-foreground">添加简历</h2>
        </div>

        <p className="text-xs text-muted-foreground">
          本轮仅分析粘贴文本，不解析 PDF。
          {health?.mode === 'mock'
            ? '后端 MOCK 模式，不调用真实模型。'
            : health?.mode === 'dashscope' || health?.mode === 'deepseek'
              ? '后端国内模型模式，去敏正文将发送至配置的境内模型。'
              : '后端状态尚未确认；提交失败时会明确提示并保留输入。'}
          本次不保存简历。
        </p>
        {health?.configured === false && (
          <p className="text-sm text-pending">
            后端尚未配置模型凭据，不能进行真实模型分析。
          </p>
        )}
        {operation.error && (
          <p role="alert" className="text-sm text-destructive">
            {operation.error}
          </p>
        )}
        {operation.loading && (
          <Button
            variant="outline"
            onClick={() => {
              operation.cancel()
              setState('empty')
            }}
          >
            停止等待
          </Button>
        )}
        {state === 'invalid_file' && (
          <Alert variant="destructive">
            <AlertTriangle />
            <AlertTitle>暂不支持该文件类型</AlertTitle>
            <AlertDescription>
              本轮不处理文件，请直接粘贴简历文本。PDF 解析将在后续接入。
            </AlertDescription>
          </Alert>
        )}

        {state === 'parse_failed' && (
          <Alert variant="destructive">
            <AlertTriangle />
            <AlertTitle>分析未完成</AlertTitle>
            <AlertDescription>
              未生成有效初评，具体原因见上方提示。你的输入仍在，可以修改或直接重新提交；这不代表技术能力差。
            </AlertDescription>
          </Alert>
        )}

        <Card
          className={cn(
            'border-2 border-dashed p-0 transition-colors',
            isDragging ? 'border-primary bg-primary-soft' : 'border-border',
          )}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            handleFiles(e.dataTransfer.files)
          }}
        >
          <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
            {state === 'parsing' ? (
              <>
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-foreground">
                  正在分析简历文本…
                </p>
                <p className="text-xs text-muted-foreground">
                  请不要关闭页面，分析完成后会自动展示六维文字初评。
                </p>
              </>
            ) : resumeFileName ? (
              <>
                <div className="flex size-12 items-center justify-center rounded-full bg-primary-soft">
                  <FileText className="size-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground break-all">
                    {resumeFileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF · 已选择，尚未解析
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                  >
                    <RotateCcw data-icon="inline-start" />
                    更换文件
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={operation.loading}
                    onClick={clearFile}
                  >
                    <X data-icon="inline-start" />
                    移除
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex size-12 items-center justify-center rounded-full bg-primary-soft">
                  <Upload className="size-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    拖拽 PDF 文件到此处，或点击选择
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF 选择仅保留原控件，本轮不上传或解析
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => inputRef.current?.click()}
                >
                  选择文件
                </Button>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="sr-only"
              aria-label="选择简历 PDF（最大5MB）"
              onClick={(e) => {
                e.currentTarget.value = ''
              }}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs font-medium text-muted-foreground">
            或者
          </span>
          <Separator className="flex-1" />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="resume-text">粘贴简历文本</Label>
          <Textarea
            disabled={operation.loading}
            id="resume-text"
            placeholder="直接粘贴简历正文，建议包含教育背景、项目经历与技能列表…"
            className="min-h-40"
            maxLength={12000}
            value={resumeText}
            onChange={(e) => {
              setResumeFileName(null)
              operation.setError('')
              setResumeText(e.target.value)
              if (e.target.value.trim()) setState('file_selected')
            }}
          />
          <div>
            <Button
              variant="link"
              className="h-auto p-0 text-sm"
              onClick={fillSample}
              disabled={operation.loading}
            >
              <Sparkles data-icon="inline-start" />
              使用匿名示例文本填充
            </Button>
          </div>
        </div>

        <Card className="border-border bg-muted/40">
          <CardContent className="flex flex-col gap-3 py-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="privacy-confirm"
                disabled={operation.loading}
                checked={privacyConfirmed}
                onCheckedChange={(v) => setPrivacyConfirmed(v === true)}
                className="mt-0.5"
              />
              <Label
                htmlFor="privacy-confirm"
                className="text-sm font-normal leading-relaxed text-foreground"
              >
                我同意将本次文本交给本地后端进行简历初评；真实模型模式会将去敏正文发送至境内模型。请先移除不必要的个人信息。
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              研究用途同意暂未开放，不收集此项授权。
            </p>
          </CardContent>
        </Card>

        {hasContent && !privacyConfirmed && (
          <Alert>
            <ShieldCheck />
            <AlertTitle>需要先确认隐私说明</AlertTitle>
            <AlertDescription>
              勾选上方的数据使用确认后，才能继续处理你的简历内容。
            </AlertDescription>
          </Alert>
        )}

        <ActionBar
          back={
            <Button variant="ghost" onClick={() => router.push('/')}>
              返回首页
            </Button>
          }
        >
          <Button size="lg" onClick={handleContinue} disabled={!canContinue}>
            {state === 'parsing' ? '正在分析…' : '分析简历文本'}
            {state !== 'parsing' && <ArrowRight data-icon="inline-end" />}
          </Button>
        </ActionBar>
      </div>

      <div className="flex flex-col gap-5 lg:col-span-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">用途与隐私说明</CardTitle>
            <CardDescription>无需登录，不要求手机号</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
            <p>
              文本仅用于本次简历文字初评，不产生正式技术等级或个人项目增强报告。
            </p>
            <p>
              本轮服务不持久化简历或分析结果。模型服务方的数据处理政策需在使用真实个人资料前确认；基础去敏不等于完全匿名。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">处理流程</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col gap-3 text-sm">
              {[
                { label: '文本提交', desc: '确认用途并提交去敏正文' },
                { label: '后端分析', desc: '国内模型或明确标记的 Mock' },
                { label: '简历初评', desc: '即时六维文字反馈' },
              ].map((step, i) => (
                <li key={step.label} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{step.label}</p>
                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">文件要求</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="flex flex-col gap-1.5 list-disc pl-4">
              <li>PDF 选择仅保留原控件，本轮不上传或解析</li>
              <li>请直接粘贴正文进行本轮分析</li>
              <li>本轮仅处理20至12000字的粘贴文本；PDF 解析待后续接入</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
