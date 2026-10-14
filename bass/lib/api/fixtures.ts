import type { RoleId } from '@/lib/flow-context'

export const SAMPLE_TEXT = `姓名：隐去（匿名示例）
目标方向：嵌入式 / C 语言开发实习

教育背景：某大学 电子信息工程 大三在读

项目经历：基于 STM32 的智能小车控制系统
- 使用 STM32F103 作为主控，负责电机驱动与传感器采集模块的代码实现
- 通过 UART 与上位机通信，调试过程中使用逻辑分析仪排查时序问题
- 了解 FreeRTOS 基本概念，未在本项目中实际使用

技能：C 语言、STM32、UART/I2C/SPI、Git、FreeRTOS（了解）`

export const SAMPLE_JD =
  '岗位要求：熟悉 C 语言、STM32 外设寄存器操作，了解 UART/I2C/SPI 通信协议；了解 FreeRTOS 基本概念为加分项；有独立调试经验，能使用逻辑分析仪排查时序问题。'

export const ROLE_PROFILES = {
  mcu: {
    id: 'ROLE-EMB-MCU-INT',
    name: 'MCU 嵌入式软件实习',
    focus: 'C · 外设通信 · 硬件调试 · RTOS 依岗位',
    mustHave: [
      'C 语言基础',
      '寄存器/外设操作',
      'UART/I2C/SPI 通信',
      '中断与调试方法',
    ],
    bonus: ['FreeRTOS 基础', 'DMA 与资源同步'],
  },
  linux: {
    id: 'ROLE-LNX-C-INT',
    name: 'Linux 用户态 C 开发实习',
    focus: 'C · 进程线程 · 系统 I/O · IPC',
    mustHave: [
      'C 语言基础',
      '进程与线程模型',
      '文件与系统 I/O',
      '常见 IPC 机制',
    ],
    bonus: ['网络编程基础', 'Makefile/调试工具链'],
  },
  cpp: {
    id: 'ROLE-CPP-APP-INT',
    name: 'C++ 应用软件实习',
    focus: 'C++ · STL · 内存资源 · 调试工程',
    mustHave: [
      'C++ 基础语法',
      'STL 容器与算法',
      '对象生命周期/内存管理',
      '工程调试能力',
    ],
    bonus: ['Qt 基础', '多线程编程'],
  },
} as const

export interface Question {
  id: string
  dimension: string
  prompt: string
  hint: string
}

export const QUESTION_BANKS: Record<
  Exclude<RoleId, null> | 'generic',
  Question[]
> = {
  mcu: [
    {
      id: 'Q-01',
      dimension: 'C 语言基础',
      prompt:
        '用你自己的话说明 `const char *p` 与 `char *const p` 的区别，并举一个你实际用到过的场景。',
      hint: '没有标准答案，请尽量具体，说明你在什么项目里用过类似写法。',
    },
    {
      id: 'Q-02',
      dimension: '指针生命周期',
      prompt:
        '描述一次你遇到的指针或内存相关 bug：它是如何被发现、定位和修复的？',
      hint: '可以描述工具、现象、排查步骤，哪怕最终没完全解决也可以说明卡在哪里。',
    },
    {
      id: 'Q-03',
      dimension: '中断与调试',
      prompt:
        '在 MCU 项目中，你是如何验证一个中断服务函数的执行时序是否符合预期的？',
      hint: '如果用过逻辑分析仪、示波器或打印时间戳，请说明具体方法。',
    },
    {
      id: 'Q-04',
      dimension: 'RTOS 基础',
      prompt:
        '如果让你解释「任务优先级反转」，你会怎么讲？是否在实际项目中遇到过类似问题？',
      hint: '没有实际经历也可以只说明你的理解程度，不必编造经历。',
    },
    {
      id: 'Q-05',
      dimension: '外设通信',
      prompt:
        '你在项目里配置过 UART/I2C/SPI 中的哪一种？描述一次调试通信失败的真实过程。',
      hint: '请说明具体的波特率/时钟配置问题或连线问题，以及你如何验证修复有效。',
    },
    {
      id: 'Q-06',
      dimension: '工程场景',
      prompt:
        '如果当前固件在断电重启后偶发无法进入主循环，你会从哪几个方向排查？',
      hint: '按你会实际执行的顺序列出排查步骤即可，不需要覆盖所有可能性。',
    },
  ],
  linux: [
    {
      id: 'Q-01',
      dimension: '进程与线程',
      prompt:
        '说明 fork() 与 pthread_create() 的本质区别，并描述你在项目中选择哪种方式的理由。',
      hint: '可以结合内存开销、通信方式等角度说明。',
    },
    {
      id: 'Q-02',
      dimension: '系统 I/O',
      prompt:
        '描述一次你使用阻塞 I/O 遇到的问题，以及你是否尝试过非阻塞或多路复用方式解决。',
      hint: '可以提到 select/poll/epoll，也可以说明尚未实践过。',
    },
    {
      id: 'Q-03',
      dimension: 'IPC',
      prompt:
        '在你的项目里，不同进程之间是如何通信的？为什么选择这种 IPC 机制？',
      hint: '管道、共享内存、消息队列均可，说明取舍依据。',
    },
    {
      id: 'Q-04',
      dimension: '网络 I/O',
      prompt: '描述一次你调试网络连接异常（超时、断连、粘包等）的真实过程。',
      hint: '尚未实践过也可以诚实说明，并描述你目前的理解。',
    },
    {
      id: 'Q-05',
      dimension: '调试工具',
      prompt:
        '你用过 gdb、strace 或 valgrind 中的哪些工具？描述一次具体的使用场景。',
      hint: '没用过可以说明打算如何学习，不必编造经历。',
    },
    {
      id: 'Q-06',
      dimension: '工程场景',
      prompt: '一个长期运行的服务进程内存占用持续增长，你会如何定位问题？',
      hint: '按你会实际执行的排查顺序列出即可。',
    },
  ],
  cpp: [
    {
      id: 'Q-01',
      dimension: 'STL 基础',
      prompt:
        '说明 `std::vector` 和 `std::list` 的适用场景差异，并举一个你项目中的选择案例。',
      hint: '可以从插入、随机访问、缓存友好性角度说明。',
    },
    {
      id: 'Q-02',
      dimension: '内存资源',
      prompt:
        '描述一次你用智能指针（unique_ptr/shared_ptr）管理资源的真实场景，是否遇到过循环引用问题。',
      hint: '没有实践经验也可以描述你对所有权模型的理解。',
    },
    {
      id: 'Q-03',
      dimension: '调试工程',
      prompt: '描述一次你定位一个难以复现的崩溃（segfault）问题的真实过程。',
      hint: '可以提到调试器、日志、core dump 等手段。',
    },
    {
      id: 'Q-04',
      dimension: '并发基础',
      prompt:
        '如果多个线程同时读写一个共享容器，你会采取什么保护措施？是否在项目中实践过？',
      hint: '没有实践经验也可以只说明理解程度。',
    },
    {
      id: 'Q-05',
      dimension: '构建与工具链',
      prompt:
        '描述你项目使用的构建系统（CMake/Makefile），以及一次排查链接错误的真实经历。',
      hint: '可以具体到某个符号未定义或 ABI 不匹配的问题。',
    },
    {
      id: 'Q-06',
      dimension: '工程场景',
      prompt:
        '一个长期运行的 C++ 服务内存缓慢增长，你会如何定位和验证是否是内存泄漏？',
      hint: '按你会实际执行的排查顺序列出即可。',
    },
  ],
  generic: [
    {
      id: 'Q-01',
      dimension: 'C 语言基础',
      prompt:
        '用你自己的话说明指针和引用（如果学过）的核心区别，并举一个例子。',
      hint: '没有标准答案，尽量结合你实际写过的代码说明。',
    },
    {
      id: 'Q-02',
      dimension: '数据结构',
      prompt: '描述一次你需要在数组和链表之间做选择的场景，你是怎么决定的？',
      hint: '可以是课程作业或个人项目，诚实描述即可。',
    },
    {
      id: 'Q-03',
      dimension: '调试方法',
      prompt: '描述一次你花了比较长时间才定位到的 bug，最后是怎么找到的？',
      hint: '过程比结论更重要，可以包含失败的尝试。',
    },
    {
      id: 'Q-04',
      dimension: '工程基础',
      prompt: '你如何理解「编译」和「链接」的区别？是否遇到过链接错误？',
      hint: '没有实践经验也可以只说明理解程度。',
    },
  ],
}
