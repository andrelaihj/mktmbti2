import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { allQuestions, questionDimensionMap } from './data/questions';
import { profiles, calculateProfile, formatRadarData, calculateDimensions as calcDimensions } from './data/results';
import { actionPackageContent, profileToPackages } from './data/actionPackages';

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'mktmbti_state';
const HISTORY_KEY = 'diagnosisHistory';

// ============================================================================
// Context & State Management
// ============================================================================

const AppContext = createContext(null);

const initialState = {
  currentPage: 'welcome',
  currentQuestion: 1,
  answers: {},
  result: null,
  lead: null,
  isLocked: false,
};

function useLocalStorage(initial) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const validQuestionIds = allQuestions.map(q => q.id);
        const isValidQuestion = validQuestionIds.includes(parsed.currentQuestion);
        return { ...initial, ...parsed, currentPage: 'welcome', currentQuestion: isValidQuestion ? parsed.currentQuestion : allQuestions[0].id };
      }
    } catch {}
    return initial;
  });

  useEffect(() => {
    try {
      const toSave = { answers: state.answers };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {}
  }, [state.answers]);

  return [state, setState];
}

// ============================================================================
// History Management Functions
// ============================================================================

const generateId = () => `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const getHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveToHistory = (clientInfo, diagnosis, answers) => {
  const record = {
    id: generateId(),
    submittedAt: new Date().toISOString(),
    clientInfo: clientInfo || { name: '', phone: '', wechat: '' },
    diagnosis: {
      type: diagnosis.type,
      label: diagnosis.tag,
      name: diagnosis.name,
      title: diagnosis.title,
      summary: diagnosis.summary,
      dimensions: diagnosis.dimensions,
      strengths: diagnosis.strengths,
      weakness: diagnosis.weakness,
      opportunity: diagnosis.opportunity,
      actions: diagnosis.actions,
      reminder: diagnosis.reminder,
      advice: diagnosis.advice,
      actionPackage: diagnosis.actionPackage,
    },
    answers: { ...answers },
  };

  const history = getHistory();
  history.unshift(record);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return record;
};

const deleteFromHistory = (id) => {
  const history = getHistory().filter(item => item.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

const exportToCSV = () => {
  const history = getHistory();
  if (history.length === 0) {
    alert('暂无数据可导出');
    return;
  }

  const headers = ['提交时间', '客户姓名', '电话', '微信', '诊断类型', '画像标签', '产能底气', '市场嗅觉', '行动惯性', '决策算账', '诊断摘要'];
  const rows = history.map(item => [
    new Date(item.submittedAt).toLocaleString('zh-CN'),
    item.clientInfo.name || '未留资客户',
    item.clientInfo.phone || '-',
    item.clientInfo.wechat || '-',
    item.diagnosis.type || '-',
    item.diagnosis.label || '-',
    item.diagnosis.dimensions?.capacity ?? '-',
    item.diagnosis.dimensions?.marketAwareness ?? '-',
    item.diagnosis.dimensions?.actionInertia ?? '-',
    item.diagnosis.dimensions?.decisionCalc ?? '-',
    (item.diagnosis.summary || '').replace(/,/g, '，'),
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `诊断历史_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
};

const exportToJSON = () => {
  const history = getHistory();
  if (history.length === 0) {
    alert('暂无数据可导出');
    return;
  }

  const json = JSON.stringify(history, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `诊断历史_${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
};

// ============================================================================
// App Provider
// ============================================================================

function AppProvider({ children }) {
  const [state, setState] = useLocalStorage(initialState);

  const safeSetPage = useCallback((page) => {
    if (state.currentPage === 'loading' && state.isLocked) return;
    setState(prev => ({ ...prev, currentPage: page }));
  }, [state.currentPage, state.isLocked, setState]);

  const setCurrentQuestion = useCallback((num) => {
    setState(prev => ({ ...prev, currentQuestion: num }));
  }, [setState]);

  const submitAnswer = useCallback((questionId, value) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: value },
    }));
  }, [setState]);

  const calculateResult = useCallback(() => {
    const dimensions = calcDimensions(state.answers, allQuestions, questionDimensionMap);
    const profileKey = calculateProfile(dimensions);
    const profileData = profiles[profileKey];
    return { ...profileData, dimensions };
  }, [state.answers]);

  const startLoading = useCallback(() => {
    setState(prev => ({ ...prev, currentPage: 'loading', isLocked: true }));
  }, [setState]);

  const finishLoading = useCallback(() => {
    const result = calculateResult();
    setState(prev => ({
      ...prev,
      currentPage: 'result',
      result,
      isLocked: false,
    }));
  }, [calculateResult, setState]);

  const submitLead = useCallback((lead) => {
    setState(prev => ({ ...prev, lead }));
  }, [setState]);

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(initialState);
  }, [setState]);

  const actions = {
    safeSetPage,
    setCurrentQuestion,
    submitAnswer,
    startLoading,
    finishLoading,
    submitLead,
    reset,
  };

  return (
    <AppContext.Provider value={{ state, ...actions }}>
      {children}
    </AppContext.Provider>
  );
}

function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}

// ============================================================================
// Question Type Components
// ============================================================================

function YesNoSelector({ value, onChange }) {
  return (
    <div className="flex gap-4">
      <button
        onClick={() => onChange(true)}
        className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all ${
          value === true
            ? 'bg-emerald-500 text-white'
            : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
        }`}
      >
        是
      </button>
      <button
        onClick={() => onChange(false)}
        className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all ${
          value === false
            ? 'bg-rose-500 text-white'
            : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
        }`}
      >
        否
      </button>
    </div>
  );
}

function TextInput({ value, onChange, placeholder, inputType, inputUnit }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type={inputType || 'text'}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field flex-1"
      />
      {inputUnit && (
        <span className="text-neutral-400 text-sm whitespace-nowrap">{inputUnit}</span>
      )}
    </div>
  );
}

function CheckboxGroup({ value = [], onChange, options }) {
  const selectedValues = Array.isArray(value) ? value : [];
  
  const toggleOption = (option) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter(v => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  return (
    <div className="grid gap-3">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => toggleOption(option)}
          className={`p-4 rounded-xl text-left transition-all ${
            selectedValues.includes(option)
              ? 'bg-indigo-500/20 border-2 border-indigo-500 text-white'
              : 'bg-neutral-800/50 border-2 border-transparent text-neutral-400 hover:border-neutral-600'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
              selectedValues.includes(option)
                ? 'bg-indigo-500 border-indigo-500'
                : 'border-neutral-500'
            }`}>
              {selectedValues.includes(option) && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-sm">{option}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function ScaleSelector({ value, onChange, scaleLabels }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between gap-2">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`scale-btn flex-1 ${value === v ? 'selected' : ''}`}
          >
            <span className="text-sm font-medium">{v}</span>
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-neutral-500 px-1">
        <span>{scaleLabels?.[0] || '不符'}</span>
        <span>{scaleLabels?.[4] || '完全符合'}</span>
      </div>
    </div>
  );
}

function QuestionRenderer({ question, value, onChange }) {
  switch (question.type) {
    case 'yesno':
      return <YesNoSelector value={value} onChange={onChange} />;
    case 'input':
      return (
        <TextInput
          value={value}
          onChange={onChange}
          placeholder={question.inputPlaceholder}
          inputType={question.inputType}
          inputUnit={question.inputUnit}
        />
      );
    case 'multi':
      return (
        <CheckboxGroup
          value={value || []}
          onChange={onChange}
          options={question.options}
        />
      );
    case 'scale':
    default:
      return (
        <ScaleSelector
          value={value}
          onChange={onChange}
          scaleLabels={question.scaleLabels}
        />
      );
  }
}

// ============================================================================
// Welcome Page
// ============================================================================

function Welcome() {
  const { safeSetPage } = useAppContext();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center px-4 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 animate-float-gradient" />

      <button
        onClick={() => safeSetPage('history')}
        className="absolute top-4 left-4 px-4 py-2 bg-neutral-800/80 backdrop-blur-sm rounded-full text-neutral-300 text-sm flex items-center gap-2 hover:bg-neutral-700/80 transition-colors z-20"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        我的客户
      </button>

      <div className="relative z-10 text-center max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <span className="text-3xl font-bold text-white/90 tracking-wider">出·海</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight"
        >
          测一测你的出海机会
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-neutral-400 text-sm sm:text-base mb-12"
        >
          4个场景 · 22道题 · 5分钟
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => safeSetPage('questions')}
          className="btn-primary"
        >
          开始诊断
        </motion.button>
      </div>

      <div className="absolute bottom-4 right-4 text-neutral-600 text-xs">
        © 出海诊断工具
      </div>
    </motion.div>
  );
}

// ============================================================================
// Questions Page
// ============================================================================

function Questions() {
  const { state, setCurrentQuestion, submitAnswer, safeSetPage, startLoading } = useAppContext();
  const { currentQuestion: currentQId, answers } = state;

  useEffect(() => {
    if (!allQuestions.find(q => q.id === currentQId) && allQuestions.length > 0) {
      setCurrentQuestion(allQuestions[0].id);
    }
  }, [currentQId, setCurrentQuestion]);

  const question = allQuestions.find(q => q.id === currentQId);
  const currentAnswer = answers[currentQId];
  const totalQuestions = allQuestions.length;
  const currentIndex = question ? allQuestions.findIndex(q => q.id === currentQId) : 0;
  const isLastQuestion = currentIndex === allQuestions.length - 1;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const hasValidAnswer = () => {
    if (!question) return false;
    if (currentAnswer === undefined || currentAnswer === null) return false;
    if (question.type === 'multi') {
      return Array.isArray(currentAnswer) && currentAnswer.length > 0;
    }
    if (question.type === 'input') {
      return currentAnswer !== '' && currentAnswer !== null;
    }
    return true;
  };

  const handleNext = () => {
    if (isLastQuestion) {
      startLoading();
    } else {
      const nextQuestion = allQuestions[currentIndex + 1];
      setCurrentQuestion(nextQuestion.id);
    }
  };

  if (!question) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-dark-bg flex flex-col"
    >
      <div className="sticky top-0 z-10 glass-dark px-4 py-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-center mb-3">
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-medium rounded-full">
              {question.scene}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-neutral-400 text-sm">
              {currentIndex + 1} / {totalQuestions}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-lg w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQId}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
              className="card p-6 sm:p-8"
            >
              <h2 className="text-white text-lg sm:text-xl font-medium leading-relaxed mb-8">
                {question.text}
              </h2>

              <QuestionRenderer
                question={question}
                value={currentAnswer}
                onChange={(value) => submitAnswer(currentQId, value)}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="px-4 pb-8">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleNext}
            disabled={!hasValidAnswer()}
            className={`btn-primary w-full ${
              !hasValidAnswer() ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            {isLastQuestion ? '查看报告' : '下一题'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Loading Page
// ============================================================================

function Loading() {
  const { finishLoading } = useAppContext();
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      finishLoading();
    }, 3000);
    return () => clearTimeout(timerRef.current);
  }, [finishLoading]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-dark-bg flex flex-col items-center justify-center"
    >
      <div className="relative w-20 h-20 mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-indigo-400 animate-pulse-ring" />
        <div className="absolute inset-0 rounded-full border-2 border-indigo-400 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
        <div className="absolute inset-0 rounded-full border-2 border-indigo-400 animate-pulse-ring" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 rounded-full bg-indigo-500/20 flex items-center justify-center">
          <span className="text-2xl">🔍</span>
        </div>
      </div>

      <p className="text-neutral-300 text-sm mb-2">
        正在分析你的出海基因...
      </p>
      <p className="text-neutral-600 text-xs">
        这一步需要3秒
      </p>
    </motion.div>
  );
}

// ============================================================================
// Action Package Page
// ============================================================================

function ActionPackagePage() {
  const { state, safeSetPage } = useAppContext();
  const { result } = state;

  if (!result) {
    safeSetPage('welcome');
    return null;
  }

  const profileType = result.type;
  const packageIds = profileToPackages[profileType] || [];
  const packages = packageIds.map(id => actionPackageContent[id]).filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-dark-bg pb-8"
    >
      <div className="max-w-lg mx-auto px-4 pt-8">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl mb-4"
          >
            <span className="text-5xl">🎁</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-white mb-2"
          >
            你的专属行动包
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-neutral-400 text-sm"
          >
            根据你的诊断结果，为你精选{packages.length}份核心资料
          </motion.p>
        </div>

        <div className="space-y-4">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
              className="card p-5 border border-indigo-500/30"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <span className="text-indigo-400 font-bold">{index + 1}</span>
                </div>
                <h3 className="text-white font-semibold">{pkg.title}</h3>
              </div>

              <div className="space-y-3">
                {pkg.sections.map((section, sIndex) => (
                  <div key={sIndex} className="bg-neutral-800/50 rounded-lg p-3">
                    <h4 className="text-indigo-300 text-sm font-medium mb-2">
                      {section.title}
                    </h4>
                    <p className="text-neutral-300 text-xs whitespace-pre-line leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 space-y-3"
        >
          <button
            onClick={() => safeSetPage('result')}
            className="btn-secondary w-full"
          >
            返回报告
          </button>
          <p className="text-center text-neutral-500 text-xs">
            点击"返回报告"可继续查看诊断结果
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Result Page
// ============================================================================

function ResultHero({ result }) {
  const radarData = formatRadarData(result.dimensions);

  return (
    <div className="text-center mb-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring' }}
        className="mb-4"
      >
        <span className="text-5xl sm:text-7xl font-black text-white">
          {result.name}
        </span>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl sm:text-3xl font-bold text-white mb-2"
      >
        {result.title}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-neutral-400 text-base sm:text-lg mb-4"
      >
        {result.summary}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-medium rounded-full mb-4"
      >
        {result.tag}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="max-w-xs mx-auto"
      >
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: '#6b7280', fontSize: 10 }}
            />
            <Radar
              name="维度得分"
              dataKey="value"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.3}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}

function SectionCard({ title, icon, titleColor, children, borderColor }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card p-6 mb-4"
      style={borderColor ? { borderLeftWidth: 4, borderLeftColor: borderColor } : {}}
    >
      <h3 className={`font-semibold mb-3 ${titleColor}`}>
        {icon} {title}
      </h3>
      <div className="text-neutral-200 text-sm sm:text-base leading-relaxed">
        {children}
      </div>
    </motion.div>
  );
}

function ActionSteps({ actions }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid gap-4 sm:grid-cols-3 mb-4"
    >
      {actions.map((action, index) => (
        <div key={index} className="card p-4">
          <div className="step-number mb-3">
            {index + 1}
          </div>
          <p className="text-neutral-300 text-sm leading-relaxed">
            {action}
          </p>
        </div>
      ))}
    </motion.div>
  );
}

function ActionPackageCard({ result, onClaim }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card p-6 mb-4 border border-indigo-500/30 bg-indigo-500/5"
    >
      <h3 className="text-white font-bold text-lg mb-2">
        你的出海第一步行动包
      </h3>
      <p className="text-indigo-300 text-sm mb-4">
        {result.advice}
      </p>
      <div className="space-y-2 mb-6">
        {result.actionPackage.map((item, i) => (
          <p key={i} className="text-neutral-300 text-sm">• {item}</p>
        ))}
      </div>
      <button onClick={onClaim} className="btn-secondary">
        领取行动包
      </button>
    </motion.div>
  );
}

function ResourceDownloadCard() {
  const resources = [
    { name: '《谷歌B2B广告实战指南》', desc: '谷歌广告投放核心方法' },
    { name: '《外贸客户开发话术模板》', desc: '邮件+LinkedIn开发信' },
    { name: '《B2B平台+谷歌双渠道运营》', desc: '阿里国际站+谷歌协同' },
    { name: '《跨行业产品资料制作框架》', desc: '产品资料行业适配方法' },
    { name: '《外贸订单成交全流程》', desc: '询盘到回款每一步' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card p-6 mb-4 border border-emerald-500/30 bg-emerald-500/5"
    >
      <h3 className="text-white font-bold text-lg mb-2">
        B2B工厂出海核心资料包
      </h3>
      <p className="text-emerald-300 text-sm mb-4">
        5份资料专为工厂老板设计 · 扫码领取完整版
      </p>
      <div className="space-y-3">
        {resources.map((item, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
            <div>
              <p className="text-neutral-200 text-sm font-medium">{item.name}</p>
              <p className="text-neutral-500 text-xs">{item.desc}</p>
            </div>
            <div className="w-12 h-12 bg-neutral-700 rounded-lg flex items-center justify-center">
              <span className="text-neutral-400 text-lg">📄</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function Result() {
  const { state, safeSetPage, reset } = useAppContext();
  const { result } = state;
  const [showLeadModal, setShowLeadModal] = useState(false);

  if (!result) {
    safeSetPage('welcome');
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-dark-bg pb-8"
    >
      <div className="max-w-lg mx-auto px-4 pt-8">
        <ResultHero result={result} />

        <SectionCard
          title="你的家底"
          icon="✅"
          titleColor="text-emerald-400 font-semibold"
        >
          <ul className="space-y-2">
            {result.strengths.map((item, i) => (
              <li key={i} className="text-neutral-400">• {item}</li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title="你的天赋课题"
          icon="📌"
          titleColor="text-amber-400 font-semibold"
          borderColor="#fbbf24"
        >
          {result.weakness}
        </SectionCard>

        <SectionCard
          title="你的机会路径"
          icon="🎯"
          titleColor="text-indigo-400 font-semibold"
        >
          {result.opportunity}
        </SectionCard>

        <h3 className="text-white font-semibold mb-4">具体动作</h3>
        <ActionSteps actions={result.actions} />

        <SectionCard
          title="说句实在话"
          icon="💡"
          titleColor="text-rose-400/80 font-semibold"
          borderColor="rgba(251, 113, 133, 0.4)"
        >
          {result.reminder}
        </SectionCard>

        <ActionPackageCard result={result} onClaim={() => setShowLeadModal(true)} />

        <ResourceDownloadCard />

        <div className="text-center mt-8 space-y-3">
          <button
            onClick={reset}
            className="text-neutral-500 text-sm underline underline-offset-2 hover:text-neutral-300 transition-colors block mx-auto"
          >
            重新测试
          </button>
        </div>
      </div>

      <LeadModal
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        result={result}
        answers={state.answers}
      />
    </motion.div>
  );
}

// ============================================================================
// Lead Modal
// ============================================================================

function LeadModal({ isOpen, onClose, result, answers }) {
  const [form, setForm] = useState({ name: '', phone: '', wechat: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { submitLead, safeSetPage } = useAppContext();

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = '请输入姓名';
    if (!form.phone.trim()) {
      newErrors.phone = '请输入手机号';
    } else if (!/^1[3-9]\d{9}$/.test(form.phone)) {
      newErrors.phone = '手机号格式不正确';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      try {
        const clientInfo = {
          name: form.name.trim(),
          phone: form.phone.trim(),
          wechat: form.wechat.trim(),
        };

        // 保存到本地历史
        saveToHistory(clientInfo, result, answers);

        // 推送到飞书（Netlify Function）
        try {
          const response = await fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: clientInfo.name,
              phone: clientInfo.phone,
              wechat: clientInfo.wechat,
              diagnosis: {
                type: result.type,
                tag: result.tag,
                dimensions: result.dimensions,
              },
            }),
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP ${response.status}`);
          }
        } catch (apiError) {
          // 网络错误（file:// 打开）或服务不可用时，给出明确提示
          console.warn('飞书推送失败:', apiError);
          alert(
            '✅ 诊断结果已保存到本地历史记录\n\n' +
            '⚠️ 未能同步到飞书多维表格\n' +
            '   • 离线模式不支持自动同步\n' +
            '   • 请联网后在「历史记录」中手动导出\n' +
            '   • 或重新访问线上版网站'
          );
        }

        submitLead(clientInfo);
        setForm({ name: '', phone: '', wechat: '' });
        onClose();
        safeSetPage('action-package');
      } catch (error) {
        console.error('提交失败:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="relative bg-neutral-900 rounded-2xl p-8 max-w-sm w-full z-10"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-white text-xl font-bold mb-2">领取你的行动包</h2>
          <p className="text-neutral-400 text-sm mb-6">顾问将在2小时内微信联系你，发资料无销售话术</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="姓名"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <input
                type="tel"
                placeholder="手机号"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field"
              />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <input
                type="text"
                placeholder="微信号（选填）"
                value={form.wechat}
                onChange={(e) => setForm({ ...form, wechat: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-neutral-600 text-neutral-400 hover:bg-neutral-800 transition-colors">
                稍后填写
              </button>
              <button type="submit" disabled={isSubmitting} className="flex-1 py-3 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? '提交中...' : '提交'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================================
// History Page
// ============================================================================

function HistoryPage() {
  const { safeSetPage } = useAppContext();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-dark-bg"
    >
      <div className="sticky top-0 z-10 glass-dark px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button
            onClick={() => safeSetPage('welcome')}
            className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>
          <h1 className="text-white font-semibold">我的客户</h1>
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="px-3 py-1.5 bg-indigo-500/20 text-indigo-300 text-xs rounded-full hover:bg-indigo-500/30 transition-colors"
            >
              CSV
            </button>
            <button
              onClick={exportToJSON}
              className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 text-xs rounded-full hover:bg-emerald-500/30 transition-colors"
            >
              JSON
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {history.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-neutral-400 text-sm">暂无客户记录</p>
            <p className="text-neutral-500 text-xs mt-2">完成诊断后自动保存</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => safeSetPage('historyDetail')}
                data-record-id={item.id}
                className="w-full card p-4 text-left hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium">
                        {item.clientInfo.name || '未留资客户'}
                      </span>
                      <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs rounded-full">
                        {item.diagnosis.type}型
                      </span>
                    </div>
                    <div className="text-neutral-400 text-sm">
                      {item.diagnosis.label}
                    </div>
                    <div className="text-neutral-500 text-xs mt-1">
                      {formatDate(item.submittedAt)}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-6 space-y-3">
            <button
              onClick={exportToCSV}
              className="btn-secondary w-full"
            >
              导出全部数据 (CSV)
            </button>
            <button
              onClick={exportToJSON}
              className="w-full py-3 border border-neutral-700 rounded-xl text-neutral-400 hover:bg-neutral-800 transition-colors text-sm"
            >
              导出 JSON 备份
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// History Detail Page
// ============================================================================

function DimensionBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-neutral-400 text-sm w-20 shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-neutral-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-white text-sm w-8 text-right">{value}</span>
    </div>
  );
}

function HistoryDetailPage() {
  const { state, safeSetPage } = useAppContext();
  const [record, setRecord] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    const history = getHistory();
    const currentRecord = history.find(item => item.id === state.currentPage?.replace('historyDetail_', ''));
    
    const urlParams = new URLSearchParams(window.location.search);
    const recordId = urlParams.get('recordId');
    
    if (currentRecord) {
      setRecord(currentRecord);
    } else if (recordId) {
      const recordFromId = history.find(item => item.id === recordId);
      if (recordFromId) {
        setRecord(recordFromId);
      }
    }
    
    if (!record && !recordFromId) {
      const allHistory = getHistory();
      if (allHistory.length > 0) {
        setRecord(allHistory[0]);
      }
    }
  }, [state.currentPage]);

  if (!record) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-dark-bg flex items-center justify-center"
      >
        <div className="text-neutral-400">加载中...</div>
      </motion.div>
    );
  }

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getQuestionText = (questionId) => {
    const question = allQuestions.find(q => q.id === questionId);
    return question ? question.text : questionId;
  };

  const formatAnswer = (questionId, answer) => {
    if (answer === undefined || answer === null) return '-';
    if (Array.isArray(answer)) return answer.join('、');
    if (typeof answer === 'boolean') return answer ? '是' : '否';
    return String(answer);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-dark-bg pb-8"
    >
      <div className="sticky top-0 z-10 glass-dark px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button
            onClick={() => safeSetPage('history')}
            className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>
          <h1 className="text-white font-semibold">客户详情</h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="card p-5">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            客户信息
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-500 text-sm">姓名</span>
              <span className="text-white text-sm">{record.clientInfo.name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500 text-sm">电话</span>
              <span className="text-white text-sm">{record.clientInfo.phone || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500 text-sm">微信</span>
              <span className="text-white text-sm">{record.clientInfo.wechat || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500 text-sm">提交时间</span>
              <span className="text-neutral-400 text-sm">{formatDate(record.submittedAt)}</span>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            诊断结果
          </h3>
          <div className="text-center mb-4">
            <span className="text-4xl font-black text-white">{record.diagnosis.type}</span>
            <span className="text-lg text-neutral-400 ml-2">型</span>
          </div>
          <div className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 text-sm rounded-full mb-4">
            {record.diagnosis.label}
          </div>
          <p className="text-neutral-300 text-sm mb-4">{record.diagnosis.summary}</p>
          
          <div className="space-y-3">
            <DimensionBar label="产能底气" value={record.diagnosis.dimensions?.capacity || 0} color="#10b981" />
            <DimensionBar label="市场嗅觉" value={record.diagnosis.dimensions?.marketAwareness || 0} color="#f59e0b" />
            <DimensionBar label="行动惯性" value={record.diagnosis.dimensions?.actionInertia || 0} color="#6366f1" />
            <DimensionBar label="决策算账" value={record.diagnosis.dimensions?.decisionCalc || 0} color="#ec4899" />
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            诊断报告
          </h3>
          
          <div className="mb-4">
            <h4 className="text-emerald-400 text-sm font-medium mb-2">你的家底</h4>
            <ul className="text-neutral-300 text-sm space-y-1">
              {record.diagnosis.strengths?.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>

          <div className="mb-4">
            <h4 className="text-amber-400 text-sm font-medium mb-2">你的天赋课题</h4>
            <p className="text-neutral-300 text-sm">{record.diagnosis.weakness}</p>
          </div>

          <div className="mb-4">
            <h4 className="text-indigo-400 text-sm font-medium mb-2">你的机会路径</h4>
            <p className="text-neutral-300 text-sm">{record.diagnosis.opportunity}</p>
          </div>

          <div className="mb-4">
            <h4 className="text-white text-sm font-medium mb-2">具体动作</h4>
            <div className="grid gap-2">
              {record.diagnosis.actions?.map((action, i) => (
                <div key={i} className="flex items-center gap-2 text-neutral-300 text-sm">
                  <span className="w-6 h-6 bg-indigo-500/20 text-indigo-300 rounded-full flex items-center justify-center text-xs font-medium shrink-0">
                    {i + 1}
                  </span>
                  {action}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-rose-400/80 text-sm font-medium mb-2">说句实在话</h4>
            <p className="text-neutral-300 text-sm">{record.diagnosis.reminder}</p>
          </div>
        </div>

        <div className="card p-5">
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className="w-full flex items-center justify-between text-white font-semibold"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              原始答案
            </span>
            <svg
              className={`w-5 h-5 text-neutral-400 transition-transform ${showAnswers ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <AnimatePresence>
            {showAnswers && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-2 max-h-96 overflow-y-auto">
                  {allQuestions.map((q, index) => (
                    <div key={q.id} className="text-sm">
                      <span className="text-neutral-500">{index + 1}.</span>{' '}
                      <span className="text-neutral-300">{q.text}</span>
                      <div className="text-white mt-1 pl-4">
                        {formatAnswer(q.id, record.answers?.[q.id])}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => safeSetPage('history')}
          className="btn-secondary w-full"
        >
          返回列表
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// App Root
// ============================================================================

function App() {
  const { state } = useAppContext();
  const { currentPage } = state;

  const renderPage = () => {
    switch (currentPage) {
      case 'welcome': return <Welcome key="welcome" />;
      case 'questions': return <Questions key="questions" />;
      case 'loading': return <Loading key="loading" />;
      case 'result': return <Result key="result" />;
      case 'action-package': return <ActionPackagePage key="action-package" />;
      case 'history': return <HistoryPage key="history" />;
      case 'historyDetail': return <HistoryDetailPage key="historyDetail" />;
      default: return <Welcome key="welcome" />;
    }
  };

  return (
    <div className="dark">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Export
// ============================================================================

export default function Root() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
}
