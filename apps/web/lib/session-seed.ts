// 追问历史与结论卡 —— 单独的模块，因为它比「静态业务数据」重得多：
// 这里是会话页与报告页的唯一事实来源，改动它的影响面比改一条技能大。

import type { EvidenceCard } from '@zhitu/types'
import { replayHistory, type SessionRound } from './session-engine'

/* ============ 追问历史 ============ */

/**
 * 每个项目已有的追问轮次。
 * 会话页进入时从这里恢复位置与结论 —— 这就是「中途离开再进来能接着上次」的实现：
 * 状态不在浏览器里，在数据里。刷新不会长出新东西，也不会丢掉已完成的结论。
 */
export const SESSION_HISTORY: Record<string, SessionRound[]> = {
  thermal: [
    {
      round: 1,
      dimensionId: 'goal',
      dimensionIndex: 0,
      roundInDimension: 0,
      question: '智能温控终端里，这个项目要解决什么问题？做成什么样算成功？',
      basedOnPrevious: false,
      skill: '项目整体',
      action: 'answered',
      answer:
        '恒温箱原来靠机械式温控开关，波动有 ±3℃，做实验时样品会受影响。目标是把波动压到 ±0.5℃ 以内，并且能按设定曲线走，比如从 25℃ 用半小时升到 60℃ 再保持两小时。验收就是拿热电偶在同一位置连测三次，看曲线能不能贴合。',
    },
    {
      round: 2,
      dimensionId: 'goal',
      dimensionIndex: 0,
      roundInDimension: 1,
      question: '你讲到的这个因果关系，能再往后推一层吗？为什么它会带来你预期的效果？',
      basedOnPrevious: true,
      skill: 'PID',
      action: 'answered',
      answer:
        '关键是采样精度而不是控制算法。原来用的是热敏电阻，本身就有 1℃ 级别的漂移；换成数字温度传感器后，同样的 PID 参数下波动直接小了一半。所以最后定的方案是把传感器换掉，控制部分反而没怎么动。',
    },
    {
      round: 3,
      dimensionId: 'contribution',
      dimensionIndex: 1,
      roundInDimension: 0,
      question: '智能温控终端里，你在其中具体负责哪一部分？哪几行代码或哪个模块是你写的？',
      basedOnPrevious: false,
      skill: '固件',
      action: 'answered',
      answer: '主要是固件这一块，硬件是别人做的。',
    },
    {
      round: 4,
      dimensionId: 'architecture',
      dimensionIndex: 2,
      roundInDimension: 0,
      question: '智能温控终端里，整个系统的数据是怎么流动的？从一端到另一端经过了哪些环节？',
      basedOnPrevious: false,
      skill: 'I2C / SPI',
      action: 'answered',
      answer:
        '传感器通过 I2C 每 20ms 上报一次原始值，采样任务做一次中值滤波后放进队列；控制任务 10ms 取一次队列里的最新值，跑 PID 输出 PWM 占空比；通信任务走 UART 接收上位机的温度曲线，解析后写进共享的设定值结构。设定值用双缓冲，控制任务只在切换点读一次，避免读到写了一半的数据。',
    },
    {
      round: 5,
      dimensionId: 'choice',
      dimensionIndex: 3,
      roundInDimension: 0,
      question: '智能温控终端里，关键的技术选型你是怎么定的？当时还考虑过哪些方案？',
      basedOnPrevious: false,
      skill: 'FreeRTOS',
      action: 'answered',
      answer: '当时选了 FreeRTOS 就没再看别的。',
    },
    {
      round: 6,
      dimensionId: 'implementation',
      dimensionIndex: 4,
      roundInDimension: 0,
      question: '智能温控终端里，最难的那段实现是什么？你是怎么把它做出来的？',
      basedOnPrevious: false,
      skill: 'RTOS',
      action: 'answered',
      answer:
        '最难的是任务优先级。一开始把通信任务设得和采样一样高，结果上位机连续下发曲线时，控制任务被挤掉，温度会冲过头。后来改成采样 20ms 中优先级、控制 10ms 最高优先级、通信最低并且用阻塞队列，保证控制任务永远能按周期跑到。改完之后超调从 1.8℃ 降到 0.4℃。',
    },
    {
      round: 7,
      dimensionId: 'debugging',
      dimensionIndex: 5,
      roundInDimension: 0,
      question: '智能温控终端里，印象最深的一个 bug 是什么？你是怎么定位到根因的？',
      basedOnPrevious: false,
      skill: 'I2C / SPI',
      action: 'answered',
      answer:
        'I2C 会随机死锁，跑几个小时就卡住。先用示波器抓波形，发现 SDA 在第九个时钟之后一直被拉低。怀疑是从机在复位中途被打断，把复位时序调长之后照旧复现，所以排除了这条。最后在从机侧读到状态寄存器一直是忙，判断是从机正在转换时被读走，改成先读状态再读数据，问题就没了。',
    },
    {
      round: 8,
      dimensionId: 'exception',
      dimensionIndex: 6,
      roundInDimension: 0,
      question: '智能温控终端里，出现异常或边界情况时，系统是怎么处理的？',
      basedOnPrevious: false,
      skill: '异常处理',
      action: 'never-done',
      answer: '这部分当时主要是另一个同学在弄，我没有具体参与。',
    },
    {
      round: 9,
      dimensionId: 'quality',
      dimensionIndex: 7,
      roundInDimension: 0,
      question: '智能温控终端里，你怎么保证代码质量？做过哪些测试或评审？',
      basedOnPrevious: false,
      skill: '工程质量',
      action: 'skipped',
      answer: '',
    },
  ],

  drone: [
    {
      round: 1,
      dimensionId: 'goal',
      dimensionIndex: 0,
      roundInDimension: 0,
      question: '四轴无人机飞控里，这个项目要解决什么问题？做成什么样算成功？',
      basedOnPrevious: false,
      skill: '项目整体',
      action: 'answered',
      answer:
        '课程设计要做一台能自己稳住的四轴。成功标准是手动模式下松杆两秒内姿态回正，悬停十秒的位移不超过半米。当时没有 GPS，所以只做姿态环不做位置环，定位靠人眼判断。',
    },
    {
      round: 2,
      dimensionId: 'implementation',
      dimensionIndex: 4,
      roundInDimension: 0,
      question: '四轴无人机飞控里，最难的那段实现是什么？你是怎么把它做出来的？',
      basedOnPrevious: false,
      skill: '数据结构与算法',
      action: 'answered',
      answer:
        '互补滤波的系数调了很久。做法是先用静态数据测陀螺仪零漂和加速度计的噪声幅度，按两者方差比算出一个初值，再用阶跃响应看相位滞后，把权重往前调了一点。最后定的是 0.98 和 0.02，采样 1kHz 跑下来没有明显漂移。',
    },
    {
      round: 3,
      dimensionId: 'exception',
      dimensionIndex: 6,
      roundInDimension: 0,
      question: '四轴无人机飞控里，出现异常或边界情况时，系统是怎么处理的？',
      basedOnPrevious: false,
      skill: '异常处理',
      action: 'answered',
      answer: '偶尔会跳一下，重启就好了。',
    },
  ],

  gateway: [],
}

/* ============ 由简历而来、尚未核验的声明 ============ */

/** 状态为「用户声明」的结论 —— 来自简历，还没有对应的追问或材料 */
const CLAIMED_CARDS: Record<string, EvidenceCard[]> = {
  thermal: [
    {
      id: 'c-t1',
      projectId: 'thermal',
      skill: '技术文档',
      dimension: '工程质量',
      status: 'claimed',
      kind: 'claim',
      conclusion: '技术文档：简历里写了「负责编写模块设计文档」，但文档未提交，内容无法核验。',
      source: { kind: 'confirmed', label: '简历原文', excerpt: '负责编写模块设计文档。' },
    },
    {
      id: 'c-t2',
      projectId: 'thermal',
      skill: '串口通信',
      dimension: '架构与数据流',
      status: 'claimed',
      kind: 'claim',
      conclusion: '串口通信：简历里写了「熟悉 UART 通信协议」，追问中未展开过具体实现。',
      source: { kind: 'confirmed', label: '简历原文', excerpt: '熟悉 UART 通信协议。' },
    },
  ],
  drone: [],
  gateway: [],
}

/* ============ 结论卡 ============ */

/** 项目的全部结论卡：追问得来 + 简历声明。会话页与报告页共用这一个入口。 */
export function cardsOfProject(projectId: string): EvidenceCard[] {
  const history = SESSION_HISTORY[projectId] ?? []
  const { cards } = replayHistory(projectId, history)
  return [...cards, ...(CLAIMED_CARDS[projectId] ?? [])]
}

export function roundsOfProject(projectId: string): SessionRound[] {
  return SESSION_HISTORY[projectId] ?? []
}
