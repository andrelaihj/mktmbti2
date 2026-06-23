// 决策算账维度 - 风险意识场景
// 评估成本核算、风险评估、投资回报分析等理性决策能力

export const decisionQuestions = [
  {
    id: 11,
    scene: '风险意识',
    text: '你知道开拓海外市场需要多少启动资金吗？',
    type: 'scale',
    scaleLabels: ['完全没概念', '有个大概', '有初步预算', '有详细计划', '心中有数'],
    weight: 2,
  },
  {
    id: 12,
    scene: '风险意识',
    text: '如果试水海外市场，你愿意投入多少？',
    type: 'scale',
    scaleLabels: ['1万以下', '1-3万', '3-10万', '10万以上', '不确定'],
    weight: 2,
  },
  {
    id: 24,
    scene: '风险意识',
    text: '有询盘但没有成交，你会怎么做？',
    type: 'multi',
    options: ['跟负责团队开会找问题', '亲自跟进询盘内容', '让负责团队说明下一步优化方案', '看花了多少钱再决定'],
    weight: 1,
  },
  {
    id: 25,
    scene: '风险意识',
    text: '你期望多久能收回出海投入的成本？',
    type: 'scale',
    scaleLabels: ['没预期', '半年内', '1年内', '1-2年', '愿意长期投入不急着回本'],
    weight: 1,
  },
  {
    id: 26,
    scene: '风险意识',
    text: '你平时做决定主要靠什么？',
    type: 'multi',
    options: ['直觉和经验', '数据和报表', '团队讨论', '专业顾问建议', '跟风同行'],
    weight: 1,
  },
];
