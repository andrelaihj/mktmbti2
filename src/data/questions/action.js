// 行动惯性维度 - 行动记录 + 决心测试场景
// 评估执行力、过往尝试、风险承受力等因素

export const actionQuestions = [
  {
    id: 1,
    scene: '行动记录',
    text: '你参加过国际展会或行业论坛吗？',
    type: 'scale',
    scaleLabels: ['0次', '1次', '2-3次', '4-5次', '5次以上'],
    weight: 1,
  },
  {
    id: 2,
    scene: '行动记录',
    text: '你做过哪些出海准备工作？',
    type: 'multi',
    options: ['注册了海外商标', '研究了目标市场的法规', '了解了物流方案', '联系过海外客户', '找过跨境服务商', '还没做任何准备'],
    weight: 2,
  },
  {
    id: 9,
    scene: '行动记录',
    text: '你尝试过通过线上方式接触海外客户吗？',
    type: 'yesno',
    weight: 1,
  },
  {
    id: 10,
    scene: '行动记录',
    text: '你尝试过哪些方式接触海外市场？',
    type: 'multi',
    options: ['参加国际展会', '联系海外客户', '找跨境电商卖家合作', '注册跨境平台账号', '找过出海服务商', '还没尝试过'],
    weight: 1,
  },
  {
    id: 20,
    scene: '决心测试',
    text: '能接受多久才能看到海外订单？',
    type: 'scale',
    scaleLabels: ['1个月内就要看到', '3-6个月', '6-12个月', '1-2年', '可以更久'],
    weight: 1,
  },
  {
    id: 21,
    scene: '决心测试',
    text: '出海项目你会如何跟进？',
    type: 'multi',
    options: ['自己管', '安排专人跟进', '交给合作乙方'],
    weight: 1,
  },
];
