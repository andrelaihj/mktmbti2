// 市场嗅觉维度 - 市场洞察场景
// 评估对市场趋势、客户需求、竞争对手的感知能力

export const marketQuestions = [
  {
    id: 3,
    scene: '市场洞察',
    text: '你目前的客户主要来自哪些地区？',
    type: 'multi',
    options: ['国内线下', '国内线上（淘宝/京东等）', '国内批发/经销商', '跨境电商平台', '海外直接客户', '海外批发/经销商'],
    weight: 2,
  },
  {
    id: 4,
    scene: '市场洞察',
    text: '你有正在运营的跨境电商平台店铺吗？',
    type: 'yesno',
    weight: 2,
  },
  {
    id: 5,
    scene: '市场洞察',
    text: '你关注过哪些海外市场？',
    type: 'multi',
    options: ['东南亚（Shopee/Lazada等）', '北美（Amazon/eBay等）', '欧洲（各国家平台）', '中东（Noon等）', '日韩（Rakuten等）', '还没确定目标市场'],
    weight: 1,
  },
  {
    id: 6,
    scene: '市场洞察',
    text: '你知道目标市场的客户更看重什么吗？',
    type: 'scale',
    scaleLabels: ['完全不了解', '大概知道一点', '基本了解', '比较了解', '非常了解目标用户'],
    weight: 2,
  },
  {
    id: 7,
    scene: '市场洞察',
    text: '你了解海外目标市场的进入门槛吗？',
    type: 'scale',
    scaleLabels: ['完全不知道', '听说过一点', '知道大概', '了解较全面', '清楚所有要求和限制'],
    weight: 1,
  },
  {
    id: 8,
    scene: '市场洞察',
    text: '产品出口海外还缺什么？',
    type: 'multi',
    options: ['英文包装/说明书', '质量认证（CE/FCC等）', '出口资质', '海外商标注册', '物流解决方案', '都准备好了'],
    weight: 1,
  },
];
