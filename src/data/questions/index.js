import { capacityQuestions } from './capacity';
import { marketQuestions } from './market';
import { actionQuestions } from './action';
import { decisionQuestions } from './decision';

// 合并所有题目（action -> market -> capacity -> decision，保持逻辑顺序）
export const allQuestions = [
  ...actionQuestions,   // 行动记录优先
  ...marketQuestions,   // 市场洞察
  ...capacityQuestions, // 资源盘点
  ...decisionQuestions, // 风险意识 + 决心测试
];

// 维度题目ID映射（用于计算维度得分）
export const dimensionMap = {
  capacity: capacityQuestions.map(q => q.id),
  market: marketQuestions.map(q => q.id),
  action: actionQuestions.map(q => q.id),
  decision: decisionQuestions.map(q => q.id),
};

// 反向映射：题目ID -> 维度
export const questionDimensionMap = {};
Object.entries(dimensionMap).forEach(([dim, ids]) => {
  ids.forEach(id => {
    questionDimensionMap[id] = dim;
  });
});

// 场景分组
export const scenes = [
  { id: '行动记录', name: '行动记录', icon: '📝' },
  { id: '市场洞察', name: '市场洞察', icon: '🔍' },
  { id: '资源盘点', name: '资源盘点', icon: '🏭' },
  { id: '风险意识', name: '风险意识', icon: '🧮' },
  { id: '决心测试', name: '决心测试', icon: '💪' },
];

// 维度中文名称映射
export const dimensionNames = {
  capacity: '产能底气',
  market: '市场嗅觉',
  action: '行动惯性',
  decision: '决策算账',
};
