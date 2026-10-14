'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/** 拷打模式的语音输入 —— 用浏览器原生 Web Speech API，不支持的浏览器静默降级为纯打字。 */
export function useSpeechRecognition(onFinalText: (text: string) => void) {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const onFinalTextRef = useRef(onFinalText)
  onFinalTextRef.current = onFinalText

  useEffect(() => {
    const Ctor = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!Ctor) return

    const recognition = new Ctor()
    recognition.lang = 'zh-CN'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.onresult = (event: any) => {
      let finalText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalText += event.results[i][0].transcript
      }
      if (finalText) onFinalTextRef.current(finalText)
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    recognitionRef.current = recognition
    setSupported(true)

    return () => {
      recognition.onresult = null
      recognition.onend = null
      recognition.onerror = null
      recognition.abort()
    }
  }, [])

  const toggle = useCallback(() => {
    const recognition = recognitionRef.current
    if (!recognition) return
    if (listening) {
      recognition.stop()
      setListening(false)
    } else {
      try {
        recognition.start()
        setListening(true)
      } catch {
        // 已在监听中时 start() 会抛错，忽略即可
      }
    }
  }, [listening])

  return { supported, listening, toggle }
}
