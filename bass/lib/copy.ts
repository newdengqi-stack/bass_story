export async function copyText(text: string): Promise<void> {
  if (!navigator.clipboard?.writeText)
    throw new Error('当前浏览器不支持复制，请手动选择文本。')
  await navigator.clipboard.writeText(text)
}
