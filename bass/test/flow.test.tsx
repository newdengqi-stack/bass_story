import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { FlowProvider, useFlow } from '@/lib/flow-context'
import { Button } from '@/components/ui/button'

function Harness() {
  const f = useFlow()
  return (
    <>
      <Button onClick={() => f.setFactsConfirmed(true)}>确认</Button>
      <Button onClick={() => f.setProjectName('我的 Python 项目')}>
        修改项目
      </Button>
      <Button onClick={() => f.setJdExtracted(true)}>确认 JD</Button>
      <Button onClick={() => f.setJdText('新岗位要求 Python')}>修改 JD</Button>
      <Button
        onClick={() => {
          f.setRoleId('mcu')
          f.setMode('skillonly')
        }}
      >
        通用诊断
      </Button>
      <output data-testid="state">
        {JSON.stringify({
          facts: f.factsConfirmed,
          jd: f.jdExtracted,
          role: f.roleId,
          skills: f.skillClaims,
          project: f.projectName,
        })}
      </output>
    </>
  )
}
function state() {
  return JSON.parse(screen.getByTestId('state').textContent!)
}
describe('真实 Context 回归', () => {
  it('真实按钮能处理确认交互', () => {
    render(
      <FlowProvider>
        <Harness />
      </FlowProvider>,
    )
    fireEvent.click(screen.getByText('确认'))
    expect(state().facts).toBe(true)
  })
  it('空会话不凭空附加 STM32 项目及技能', () => {
    render(
      <FlowProvider>
        <Harness />
      </FlowProvider>,
    )
    expect(state().skills).toEqual([])
    expect(state().project).toBe('')
  })
  it('修改事实撤销确认', () => {
    render(
      <FlowProvider>
        <Harness />
      </FlowProvider>,
    )
    fireEvent.click(screen.getByText('确认'))
    fireEvent.click(screen.getByText('修改项目'))
    expect(state().facts).toBe(false)
  })
  it('修改 JD 撤销此前提取确认', () => {
    render(
      <FlowProvider>
        <Harness />
      </FlowProvider>,
    )
    fireEvent.click(screen.getByText('确认 JD'))
    fireEvent.click(screen.getByText('修改 JD'))
    expect(state().jd).toBe(false)
  })
  it('通用诊断清空此前岗位', () => {
    render(
      <FlowProvider>
        <Harness />
      </FlowProvider>,
    )
    fireEvent.click(screen.getByText('通用诊断'))
    expect(state().role).toBe(null)
  })
})
