import { useState, useRef, useEffect } from "react";
import { 
  Brain, 
  Compass, 
  Heart, 
  Sparkles, 
  BookOpen, 
  Award, 
  MessageSquare, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  ChevronRight, 
  Loader2, 
  Activity, 
  Info, 
  HelpCircle, 
  Trash2,
  Plus
} from "lucide-react";
import Markdown from "react-markdown";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { MBTI_DATA, ENNEAGRAM_DATA, BIG_FIVE_DATA, PRESET_PROBLEMS } from "./data";
import { MBTIPersonality, EnneagramPersonality, ChatMessage } from "./types";
import { MBTI_QUIZ, ENNEAGRAM_QUIZ, BIG_FIVE_QUIZ as BIG_FIVE_QUIZ_EXPANDED } from "./quizzes";

export default function App() {
  // Navigation: "encyclopedia" | "assessment" | "consultation"
  const [activeTab, setActiveTab] = useState<"encyclopedia" | "assessment" | "consultation">("encyclopedia");

  // --- Sub-Tabs for Encyclopedia ---
  const [encTab, setEncTab] = useState<"mbti" | "enneagram">("mbti");
  const [mbtiFilter, setMbtiFilter] = useState<string>("All"); // All or Analytical, etc.
  const [enneagramFilter, setEnneagramFilter] = useState<string>("All"); // All or gut, etc.
  const [selectedMbti, setSelectedMbti] = useState<MBTIPersonality | null>(MBTI_DATA.find(x => x.id === "infj") || null);
  const [selectedEnneagram, setSelectedEnneagram] = useState<EnneagramPersonality | null>(ENNEAGRAM_DATA[0]);

  // --- Multi-System Personality Assessment States ---
  const [selectedQuizType, setSelectedQuizType] = useState<"mbti" | "enneagram" | "bigfive" | null>(null);
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  // --- AI Consultation Client State ---
  const [consultSystem, setConsultSystem] = useState<"MBTI" | "Enneagram" | "BigFive">("MBTI");
  const [consultType, setConsultType] = useState<string>("INFJ - 提倡者");
  const [customProblem, setCustomProblem] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Automatically scroll chat to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Initial MBTI list depends on filter
  const filteredMbti = MBTI_DATA.filter((m) => {
    if (mbtiFilter === "All") return true;
    return m.category === mbtiFilter;
  });

  const mbtiCategories = [
    { code: "All", name: "全部人格" },
    { code: "Analysts", name: "分析家 (NT)" },
    { code: "Diplomats", name: "外交官 (NF)" },
    { code: "Sentinels", name: "守护者 (SJ)" },
    { code: "Explorers", name: "探险家 (SP)" }
  ];

  const enneagramCategories = [
    { code: "All", name: "全部类型" },
    { code: "Instinctive", name: "本能组/腹脑 (Type 8,9,1)" },
    { code: "Feeling", name: "情感组/心脑 (Type 2,3,4)" },
    { code: "Thinking", name: "思维组/头脑 (Type 5,6,7)" }
  ];

  const filteredEnneagram = ENNEAGRAM_DATA.filter((e) => {
    if (enneagramFilter === "All") return true;
    return e.group === enneagramFilter;
  });

  // Handle preset issues quick analysis
  const handleQuickQuestion = (presetQ: string) => {
    setCustomProblem(presetQ);
    // Smooth scroll to input area if needed
  };

  // Switch to counseling with prefilled type
  const triggerCounseling = (system: "MBTI" | "Enneagram", code: string) => {
    setConsultSystem(system);
    setConsultType(code);
    setActiveTab("consultation");
    // Offer default problem
    setCustomProblem("我在面对日常复杂的工作和生活压力时，很容易陷入自我怀疑，如何用我的人格优势做出突破？");
  };

  // Submit assessment quiz answer
  const handleQuizAnswerSubmit = (questionId: number, score: number) => {
    const updatedAnswers = { ...quizAnswers, [questionId]: score };
    setQuizAnswers(updatedAnswers);

    const questionsLength = 
      selectedQuizType === "mbti" ? MBTI_QUIZ.length :
      selectedQuizType === "enneagram" ? ENNEAGRAM_QUIZ.length :
      BIG_FIVE_QUIZ_EXPANDED.length;

    if (currentQuizIndex < questionsLength - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  // Reset Assessment Quiz
  const resetQuiz = () => {
    setCurrentQuizIndex(0);
    setQuizAnswers({});
    setQuizCompleted(false);
    setQuizStarted(false);
    setSelectedQuizType(null);
  };

  // Calculations for Big Five
  const calculateBigFiveScores = () => {
    const O_ids = [1, 6, 11, 16, 21];
    const C_ids = [2, 7, 12, 17, 22];
    const E_ids = [3, 8, 13, 18, 23];
    const A_ids = [4, 9, 14, 19, 24];
    const N_ids = [5, 10, 15, 20, 25];

    const sumO = O_ids.reduce((sum, id) => sum + (quizAnswers[id] || 3), 0);
    const sumC = C_ids.reduce((sum, id) => sum + (quizAnswers[id] || 3), 0);
    const sumE = E_ids.reduce((sum, id) => sum + (quizAnswers[id] || 3), 0);
    const sumA = A_ids.reduce((sum, id) => sum + (quizAnswers[id] || 3), 0);
    const sumN = N_ids.reduce((sum, id) => sum + (quizAnswers[id] || 3), 0);

    return {
      O: Math.round((sumO - 5) / 20 * 100),
      C: Math.round((sumC - 5) / 20 * 100),
      E: Math.round((sumE - 5) / 20 * 100),
      A: Math.round((sumA - 5) / 20 * 100),
      N: Math.round((sumN - 5) / 20 * 100)
    };
  };

  // Calculations for MBTI
  const calculateMBTIScores = () => {
    const EI_ids = [1, 2, 3, 4, 5, 6];
    const SN_ids = [7, 8, 9, 10, 11, 12];
    const TF_ids = [13, 14, 15, 16, 17, 18];
    const JP_ids = [19, 20, 21, 22, 23, 24];

    const sumEI = EI_ids.reduce((sum, id) => sum + (quizAnswers[id] || 3), 0);
    const sumSN = SN_ids.reduce((sum, id) => sum + (quizAnswers[id] || 3), 0);
    const sumTF = TF_ids.reduce((sum, id) => sum + (quizAnswers[id] || 3), 0);
    const sumJP = JP_ids.reduce((sum, id) => sum + (quizAnswers[id] || 3), 0);

    const E_pct = Math.round((sumEI - 6) / 24 * 100);
    const I_pct = 100 - E_pct;

    const N_pct = Math.round((sumSN - 6) / 24 * 100);
    const S_pct = 100 - N_pct;

    const F_pct = Math.round((sumTF - 6) / 24 * 100);
    const T_pct = 100 - F_pct;

    const P_pct = Math.round((sumJP - 6) / 24 * 100);
    const J_pct = 100 - P_pct;

    const mbtiCode = `${E_pct >= 50 ? "E" : "I"}${N_pct >= 50 ? "N" : "S"}${F_pct >= 50 ? "F" : "T"}${P_pct >= 50 ? "P" : "J"}`;

    return {
      code: mbtiCode,
      E: E_pct,
      I: I_pct,
      S: S_pct,
      N: N_pct,
      T: T_pct,
      F: F_pct,
      J: J_pct,
      P: P_pct
    };
  };

  // Calculations for Enneagram
  const calculateEnneagramScores = () => {
    const scores: Record<string, number> = {};
    for (let t = 1; t <= 9; t++) {
      const qId1 = t;
      const qId2 = t + 9;
      const qId3 = t + 18;
      const rawScore = (quizAnswers[qId1] || 3) + (quizAnswers[qId2] || 3) + (quizAnswers[qId3] || 3);
      scores[t.toString()] = Math.round((rawScore - 3) / 12 * 100);
    }

    let dominantType = "1";
    let maxPct = -1;
    for (const [type, pct] of Object.entries(scores)) {
      if (pct > maxPct) {
        maxPct = pct;
        dominantType = type;
      }
    }

    return {
      scores,
      dominantType
    };
  };

  // Render score breakdown text
  const getTraitDescription = (traitCode: string, score: number) => {
    const trait = BIG_FIVE_DATA.find((t) => t.id === traitCode.toLowerCase());
    if (!trait) return { title: "", text: "", level: "" };

    if (score >= 80) {
      return {
        title: `${trait.name} (偏高)`,
        text: trait.highTraits,
        level: "High",
        bgClass: "bg-emerald-50 text-emerald-800 border-emerald-150"
      };
    } else if (score <= 40) {
      return {
        title: `${trait.name} (偏低)`,
        text: trait.lowTraits,
        level: "Low",
        bgClass: "bg-blue-50 text-blue-800 border-blue-150"
      };
    } else {
      return {
        title: `${trait.name} (中等均衡)`,
        text: "情绪与行为在该特质上表现得非常弹性而均衡，能根据环境 and 心智自由调节。在稳健务实和探索创新方面均表现得宜。",
        level: "Medium",
        bgClass: "bg-slate-50 text-slate-800 border-slate-150"
      };
    }
  };

  // Submit analysis request to server API
  const handleConsultRequest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customProblem.trim()) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: customProblem,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setCustomProblem("");
    setLoadingAnalysis(true);
    setApiError(null);

    try {
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personalitySystem: consultSystem,
          personalityType: consultType,
          question: userMsg.content,
          history: chatMessages
        })
      });

      if (!response.ok) {
        throw new Error("模型响应失败，请稍后再试或检查服务器配置。");
      }

      const data = await response.json();
      
      const modelMsg: ChatMessage = {
        role: "model",
        content: data.result || "抱歉，分析师暂时陷入了思考空白，请重试。",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      setApiError(err.message || "连接服务器失败");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // Clear Chat history
  const clearChatHistory = () => {
    setChatMessages([]);
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-slate-200 font-sans antialiased flex flex-col relative overflow-hidden">
      {/* Immersive background glow decorations */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* HEADER SECTION */}
      <header className="border-b border-slate-800/40 bg-slate-900/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-300 p-2.5 rounded-xl border border-indigo-500/30 shadow-md">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 tracking-tight">PsycheCore</h1>
              <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">人格深度分析与 AI 心理疗愈系统</p>
            </div>
          </div>

          {/* MAIN NAV TABS */}
          <nav className="flex bg-slate-950/60 p-1 rounded-xl gap-1 border border-slate-900 z-10">
            <button
              onClick={() => setActiveTab("encyclopedia")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "encyclopedia" 
                  ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-xs" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
              id="nav-encyclopedia"
            >
              <BookOpen className="w-4 h-4" />
              <span>智能百科馆</span>
            </button>
            <button
              onClick={() => setActiveTab("assessment")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "assessment" 
                  ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-xs" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
              id="nav-assessment"
            >
              <Award className="w-4 h-4" />
              <span>大脑及特质评测</span>
            </button>
            <button
              onClick={() => setActiveTab("consultation")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "consultation" 
                  ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-xs" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
              id="nav-consultation"
            >
              <MessageSquare className="w-4 h-4" />
              <span>AI 心理疗愈</span>
            </button>
          </nav>
        </div>
      </header>

      {/* CORE BODY CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: ALL ENCYCLOPEDIA */}
        {activeTab === "encyclopedia" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900/40 border border-indigo-900/30 rounded-2xl p-6 text-slate-200 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="relative z-10 max-w-2xl">
                <span className="bg-indigo-500/25 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border border-indigo-500/20">系统深度透视</span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-3 bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-indigo-300">深度探究自我与他人的心理地图</h2>
                <p className="mt-2 text-slate-400 text-sm leading-relaxed">
                  无论经典流行的 <strong className="text-slate-200">Myers-Briggs 16型人格 (MBTI)</strong>，还是剖析人类深层内在动机的 <strong className="text-slate-200">九型人格 (Enneagram)</strong>。我们为你备齐了所有体系的人格说明。阅览并选择你的精神阵位，开启对你内心盲区的治愈旅程。
                </p>
              </div>
            </div>

            {/* INNER SYSTEM SELECTION TAB */}
            <div className="flex border-b border-slate-800/60 gap-6">
              <button
                onClick={() => setEncTab("mbti")}
                className={`py-3 text-base font-bold relative transition ${
                  encTab === "mbti" ? "text-indigo-400 font-semibold" : "text-slate-500 hover:text-slate-350"
                }`}
              >
                MBTI 16型人格百科
                {encTab === "mbti" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></div>}
              </button>
              <button
                onClick={() => setEncTab("enneagram")}
                className={`py-3 text-base font-bold relative transition ${
                  encTab === "enneagram" ? "text-indigo-400 font-semibold" : "text-slate-500 hover:text-slate-350"
                }`}
              >
                九型人格核心动机库
                {encTab === "enneagram" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></div>}
              </button>
            </div>

            {/* ENCYCLOPEDIA CONTENT: MBTI */}
            {encTab === "mbti" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT LIST WITH FILTERS */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {mbtiCategories.map((cat) => (
                      <button
                        key={cat.code}
                        onClick={() => setMbtiFilter(cat.code)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                          mbtiFilter === cat.code
                            ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                            : "bg-slate-900/40 text-slate-400 border-slate-800/80 hover:bg-slate-800/40 hover:text-slate-200"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
                    {filteredMbti.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedMbti(item)}
                        className={`p-4 rounded-xl text-left border transition flex flex-col h-28 justify-between relative ${
                          selectedMbti?.id === item.id
                            ? "bg-indigo-950/20 border-indigo-500/50 ring-1 ring-indigo-500/30 shadow-md shadow-indigo-950/20"
                            : "bg-slate-900/20 border-slate-800/80 hover:border-slate-700/60 hover:bg-slate-800/20 text-slate-300"
                        }`}
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className="text-2xl">{item.avatar}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            item.category === 'Analysts' ? 'bg-purple-950/40 text-purple-300 border-purple-800/30' :
                            item.category === 'Diplomats' ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/30' :
                            item.category === 'Sentinels' ? 'bg-blue-950/40 text-blue-300 border-blue-800/30' : 'bg-amber-950/40 text-amber-300 border-amber-800/30'
                          }`}>
                            {item.categoryName}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-indigo-400 font-mono font-bold leading-none mb-1">{item.code}</p>
                          <h4 className="text-sm font-bold text-slate-250">{item.name}</h4>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* RIGHT DETAILED PANE */}
                <div className="lg:col-span-7 bg-slate-900/25 border border-slate-800/50 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8 space-y-6 z-10">
                  {selectedMbti ? (
                    <>
                      {/* Detailed Header */}
                      <div className="flex items-center gap-4 pb-6 border-b border-slate-800/40">
                        <span className="text-5xl">{selectedMbti.avatar}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-2xl font-bold text-white tracking-tight">{selectedMbti.name}</h3>
                            <span className="text-lg font-mono font-semibold text-indigo-400">({selectedMbti.code})</span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">类别：{selectedMbti.categoryName} Persona</p>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="p-4 bg-slate-950/60 border border-slate-800/40 rounded-xl">
                        <p className="text-sm text-slate-350 italic leading-relaxed">“ {selectedMbti.summary} ”</p>
                      </div>

                      {/* Diagnostic Traits */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-indigo-400" /> 特质标志
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedMbti.traits.map((t, idx) => (
                            <span key={idx} className="bg-slate-950 text-slate-350 border border-slate-850 text-xs px-2.5 py-1 rounded-full font-medium">#{t}</span>
                          ))}
                        </div>
                      </div>

                      {/* Strengths & Weaknesses */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-emerald-950/10 p-5 rounded-xl border border-emerald-500/20 space-y-2">
                          <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> 典型优势
                          </h4>
                          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                            {selectedMbti.strengths.map((str, idx) => (
                              <li key={idx} className="leading-relaxed">{str}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-rose-950/15 p-5 rounded-xl border border-rose-500/20 space-y-2">
                          <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-rose-500 rounded-full"></span> 潜在盲区/弱项
                          </h4>
                          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                            {selectedMbti.weaknesses.map((wk, idx) => (
                              <li key={idx} className="leading-relaxed">{wk}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Inner Growth & Psychology Advice */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-indigo-400" /> 心理成长路线建议
                        </h4>
                        <div className="space-y-2">
                          {selectedMbti.growthAdvice.map((adv, idx) => (
                            <div key={idx} className="flex gap-2.5 items-start text-xs text-slate-300 bg-slate-950/30 p-3 rounded-lg border border-slate-850">
                              <span className="text-indigo-400 font-bold font-mono">0{idx + 1}.</span>
                              <p className="leading-relaxed">{adv}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Professional Fit */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                          <Compass className="w-4 h-4 text-indigo-400" /> 人格黄金职业向度
                        </h4>
                        <div className="bg-slate-950/30 border border-slate-850 px-4 py-3 rounded-xl flex flex-wrap gap-2">
                          {selectedMbti.careerSuggestions.map((car, idx) => (
                            <span key={idx} className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-xs font-bold text-indigo-300">
                              {car}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* FAST LAUNCH TO AI CONSULTATION */}
                      <div className="pt-4 border-t border-slate-800/60 flex justify-end">
                        <button
                          onClick={() => triggerCounseling("MBTI", `${selectedMbti.code} - ${selectedMbti.name}`)}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer group"
                        >
                          <span>以 {selectedMbti.code} ({selectedMbti.name}) 身份求助AI心理分析员</span>
                          <ChevronRight className="w-4 h-4 transition group-hover:translate-x-0.5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-20 text-slate-400">
                      <Info className="w-12 h-12 mx-auto mb-3" />
                      <p>请点击左侧列表查看特定人格详情</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ENCYCLOPEDIA CONTENT: ENNEAGRAM */}
            {encTab === "enneagram" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT LIST WITH FILTERS */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {enneagramCategories.map((cat) => (
                      <button
                        key={cat.code}
                        onClick={() => setEnneagramFilter(cat.code)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                          enneagramFilter === cat.code
                            ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                            : "bg-slate-900/40 text-slate-400 border-slate-800/80 hover:bg-slate-800/40 hover:text-slate-200"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-3 max-h-[600px] overflow-y-auto pr-1">
                    {filteredEnneagram.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedEnneagram(item)}
                        className={`p-4 rounded-xl text-left border transition flex items-center justify-between ${
                          selectedEnneagram?.id === item.id
                            ? "bg-indigo-950/20 border-indigo-500/50 ring-1 ring-indigo-500/30 shadow-md shadow-indigo-950/20"
                            : "bg-slate-900/20 border-slate-800/80 hover:border-slate-700/60 hover:bg-slate-800/20 text-slate-300"
                        }`}
                      >
                        <div>
                          <p className="text-[10px] text-indigo-400 font-bold font-mono uppercase tracking-wider mb-0.5">{item.groupName}</p>
                          <h4 className="text-sm font-bold text-slate-200">{item.name}</h4>
                          <span className="text-xs text-slate-500 font-serif block mt-0.5">{item.englishName}</span>
                        </div>
                        <span className="text-xl font-bold font-mono text-slate-600">#{item.id}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* RIGHT DETAILED PANE */}
                <div className="lg:col-span-7 bg-slate-900/25 border border-slate-800/50 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8 space-y-6 z-10">
                  {selectedEnneagram ? (
                    <>
                      {/* Detailed Header */}
                      <div className="flex items-center gap-4 pb-6 border-b border-slate-800/40">
                        <div className="w-12 h-12 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-2xl font-black font-mono rounded-xl shadow-inner">
                          {selectedEnneagram.id}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white tracking-tight">{selectedEnneagram.name}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{selectedEnneagram.groupName} | {selectedEnneagram.englishName}</p>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="p-4 bg-slate-950/60 border border-slate-800/40 rounded-xl">
                        <p className="text-sm text-slate-350 leading-relaxed italic">“ {selectedEnneagram.summary} ”</p>
                      </div>

                      {/* Fear & Desires Box */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-rose-950/15 border border-rose-500/20 rounded-xl space-y-1">
                          <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span> 潜意识恐惧 (Core Fear)
                          </h4>
                          <p className="text-xs text-slate-300 leading-relaxed font-medium">{selectedEnneagram.scaredOf}</p>
                        </div>
                        <div className="p-4 bg-blue-950/15 border border-blue-500/20 rounded-xl space-y-1">
                          <h4 className="text-xs font-bold text-blue-450 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span> 潜意识欲望 (Core Desire)
                          </h4>
                          <p className="text-xs text-slate-300 leading-relaxed font-medium">{selectedEnneagram.desires}</p>
                        </div>
                      </div>

                      {/* Strengths & Weaknesses */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 人格亮丽面 (Strengths)
                          </h4>
                          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside bg-slate-950/30 p-4 rounded-xl border border-slate-850">
                            {selectedEnneagram.strengths.map((s, idx) => (
                              <li key={idx} className="leading-relaxed">{s}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5" /> 隐蔽软肋防线 (Blindspots)
                          </h4>
                          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside bg-slate-950/30 p-4 rounded-xl border border-slate-850">
                            {selectedEnneagram.weaknesses.map((w, idx) => (
                              <li key={idx} className="leading-relaxed">{w}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Development prompts */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-indigo-400" /> 九型人格自我超越修行方案
                        </h4>
                        <div className="space-y-2">
                          {selectedEnneagram.growthAdvice.map((adv, idx) => (
                            <div key={idx} className="flex gap-2 items-start text-xs text-slate-300 bg-slate-950/30 p-3 rounded-lg border border-slate-850">
                              <span className="text-indigo-400 font-medium font-mono shrink-0">修行点 {idx + 1}:</span>
                              <p className="leading-relaxed">{adv}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* FAST LAUNCH TO AI CONSULTATION */}
                      <div className="pt-4 border-t border-slate-800/60 flex justify-end">
                        <button
                          onClick={() => triggerCounseling("Enneagram", `第 ${selectedEnneagram.id} 型 - ${selectedEnneagram.name.split('：')[1]}`)}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer group"
                        >
                          <span>以第 {selectedEnneagram.id} 型身份求助AI心理分析员</span>
                          <ChevronRight className="w-4 h-4 transition group-hover:translate-x-0.5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-20 text-slate-500">
                      <Info className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                      <p>请点击左侧列表查看特定人格详情</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PERSONALITY PORTAL HUB */}
        {activeTab === "assessment" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900/40 border border-indigo-900/30 rounded-2xl p-6 text-slate-200 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="relative z-10 max-w-2xl font-sans">
                <span className="bg-indigo-500/25 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border border-indigo-500/20">心灵测量之术</span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-3 bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-indigo-300">多维人格体系深度自测中心</h2>
                <p className="mt-2 text-slate-400 text-sm leading-relaxed">
                  本评估系统支持学术界广泛认可的 <strong className="text-slate-200">大五特质光谱 (OCEAN 25题)</strong>、流行广泛的 <strong className="text-slate-200">MBTI 职业性格倾向评估 (24题)</strong> 以及探索灵魂深层动机的 <strong className="text-slate-200">九型人格自我动机仪 (27题)</strong>。请点击下方卡片选择契合你的系统开始测量。
                </p>
              </div>
            </div>

            {/* SELECTION PORTAL HUB SCREEN */}
            {!selectedQuizType && !quizStarted && !quizCompleted && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto z-10 relative">
                {/* Card 1: MBTI */}
                <div className="bg-slate-900/25 border border-slate-800/60 backdrop-blur-xl rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:border-indigo-500/40 transition hover:bg-slate-900/40 group shadow-lg">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-indigo-500/10 text-indigo-450 border border-indigo-500/20 rounded-xl flex items-center justify-center text-xl shadow-inner font-mono font-bold">MB</div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition">MBTI 职业性格判定测验</h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                        通过注意力方向（E/I）、认知事物方式（S/N）、决策偏好（T/F）及行为处事（J/P）四重维度，快速破译你的十六型职业性格面具。
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
                      <span>题目数量：<strong className="text-indigo-400">24题</strong></span>
                      <span>预估用时：<strong className="text-indigo-400">约3分钟</strong></span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedQuizType("mbti");
                      setQuizStarted(true);
                      setCurrentQuizIndex(0);
                      setQuizAnswers({});
                    }}
                    className="w-full bg-indigo-950/40 hover:bg-indigo-650 text-indigo-300 hover:text-white border border-indigo-500/25 font-bold py-2.5 rounded-xl transition text-xs shadow-md cursor-pointer"
                  >
                    开始 MBTI 专业版测验
                  </button>
                </div>

                {/* Card 2: Enneagram */}
                <div className="bg-slate-900/25 border border-slate-800/60 backdrop-blur-xl rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:border-indigo-500/40 transition hover:bg-slate-900/40 group shadow-lg">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl flex items-center justify-center text-xl shadow-inner font-mono font-bold">EG</div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition">九型人格核心动机探针</h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                        探寻潜意识中的核心欲望与原生恐惧，判定你归属于本能组（腹脑）、情感组（心脑）还是思维组（头脑），全面认准自我的局限与盲圈。
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
                      <span>题目数量：<strong className="text-purple-400">27题</strong></span>
                      <span>预估用时：<strong className="text-purple-400">约4分钟</strong></span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedQuizType("enneagram");
                      setQuizStarted(true);
                      setCurrentQuizIndex(0);
                      setQuizAnswers({});
                    }}
                    className="w-full bg-purple-950/40 hover:bg-purple-650 text-purple-300 hover:text-white border border-purple-500/25 font-bold py-2.5 rounded-xl transition text-xs shadow-md cursor-pointer"
                  >
                    开始九型动机探针测验
                  </button>
                </div>

                {/* Card 3: Big Five */}
                <div className="bg-slate-900/25 border border-slate-800/60 backdrop-blur-xl rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:border-indigo-500/40 transition hover:bg-slate-900/40 group shadow-lg">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 rounded-xl flex items-center justify-center text-xl shadow-inner font-mono font-bold">O5</div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition">学术界大五特质经典测验</h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                        通过开放性 (O)、尽责性 (C)、外向性 (E)、宜人性 (A) 以及情绪不稳定性 (N) 描述，绘制最符合现代学术标准和职业测评要求的基准报告。
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
                      <span>题目数量：<strong className="text-emerald-400">25题</strong></span>
                      <span>预估用时：<strong className="text-emerald-400">约3分钟</strong></span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedQuizType("bigfive");
                      setQuizStarted(true);
                      setCurrentQuizIndex(0);
                      setQuizAnswers({});
                    }}
                    className="w-full bg-emerald-950/40 hover:bg-emerald-650 text-emerald-300 hover:text-white border border-emerald-500/25 font-bold py-2.5 rounded-xl transition text-xs shadow-md cursor-pointer"
                  >
                    开始学术大五光谱测验
                  </button>
                </div>
              </div>
            )}

            {/* QUIZ ACTIVE QUESTION CASCADE PROGRESS */}
            {quizStarted && !quizCompleted && selectedQuizType && (() => {
              const questions = 
                selectedQuizType === "mbti" ? MBTI_QUIZ :
                selectedQuizType === "enneagram" ? ENNEAGRAM_QUIZ :
                BIG_FIVE_QUIZ_EXPANDED;
              
              const currentQuestion = questions[currentQuizIndex];
              if (!currentQuestion) return null;

              // Title mapping for showing which subdimension is active
              let activeSubTitle = "";
              if (selectedQuizType === "mbti") {
                const dim = currentQuestion.dimension;
                activeSubTitle = 
                  dim === "EI" ? "精力向度 (外向 E vs 内向 I)" :
                  dim === "SN" ? "认知方式 (直觉 N vs 实感 S)" :
                  dim === "TF" ? "决策动机 (情感 F vs 理智 T)" : "处事态度 (随性 P vs 计划 J)";
              } else if (selectedQuizType === "enneagram") {
                activeSubTitle = `欲望动机探析：第 ${currentQuestion.dimension} 型倾向测算`;
              } else {
                const dim = currentQuestion.dimension;
                const traitInfo = BIG_FIVE_DATA.find(t => t.id === dim?.toLowerCase());
                activeSubTitle = traitInfo ? `大五特质：${traitInfo.name}` : "特质光谱判定";
              }

              return (
                <div className="bg-slate-900/25 border border-slate-800/50 backdrop-blur-xl rounded-2xl shadow-xl p-6 sm:p-8 max-w-4xl mx-auto z-10 relative">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center pb-4 border-b border-slate-800/40">
                      <div>
                        <span className="text-xs text-indigo-400 font-bold font-mono tracking-widest uppercase">
                          {selectedQuizType.toUpperCase()} 测验 ✦ STEP {currentQuizIndex + 1} OF {questions.length}
                        </span>
                        <h4 className="text-sm text-slate-350 font-medium mt-1">{activeSubTitle}</h4>
                      </div>
                      <span className="text-xs text-slate-500 font-mono font-bold bg-slate-950 px-2 py-1 rounded border border-slate-900">{Math.round((currentQuizIndex / questions.length) * 100)}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                        style={{ width: `${((currentQuizIndex + 1) / questions.length) * 100}%` }}
                      ></div>
                    </div>

                    {/* Question body */}
                    <div className="space-y-4 py-3">
                      <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                        {currentQuestion.text}
                      </h3>
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 gap-3 pt-2">
                      {currentQuestion.options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuizAnswerSubmit(currentQuestion.id, option.value)}
                          className="w-full p-4 text-left rounded-xl border border-slate-850/80 hover:border-indigo-500/40 hover:bg-indigo-550/5 active:bg-slate-800/40 transition flex items-center justify-between text-xs sm:text-sm text-slate-300 cursor-pointer group"
                        >
                          <span className="font-semibold">{option.label}</span>
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition group-hover:translate-x-0.5" />
                        </button>
                      ))}
                    </div>

                    {/* Back button */}
                    <div className="pt-4 border-t border-slate-850/50 flex justify-between items-center">
                      <button
                        onClick={() => {
                          if (currentQuizIndex > 0) {
                            setCurrentQuizIndex(currentQuizIndex - 1);
                          } else {
                            resetQuiz();
                          }
                        }}
                        className="text-[11px] text-slate-400 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                      >
                        ← 返回{currentQuizIndex > 0 ? "上一题" : "选择大厅"}
                      </button>
                      <span className="text-[10px] text-slate-600 font-medium font-sans">请依据当下最真实的自然反应，诚实选择答案。</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* RESPONSIVE DISPLAY RESULTS FOR QUIZ TYPES */}
            {quizCompleted && selectedQuizType && (() => {
              
              /* IF MBTI COMPLETION */
              if (selectedQuizType === "mbti") {
                const results = calculateMBTIScores();
                const currentProfile = MBTI_DATA.find(x => x.code === results.code) || MBTI_DATA[0];

                return (
                  <div className="bg-slate-900/25 border border-slate-800/50 backdrop-blur-xl rounded-2xl shadow-xl p-6 sm:p-8 max-w-4xl mx-auto z-10 relative space-y-8">
                    <div className="text-center space-y-2 pb-4 border-b border-slate-800/40">
                      <div className="inline-block bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold px-3 py-1 rounded-full">测评结果生成</div>
                      <h3 className="text-2xl font-black text-white px-2">你的 MBTI 职业性格倾向报告</h3>
                      <p className="text-xs text-slate-400 font-medium">根据 24 题深度心向折算归纳所得</p>
                    </div>

                    {/* MBTI Profiles display panel */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pb-6 border-b border-slate-800/40">
                      {/* Left: Code badge */}
                      <div className="md:col-span-4 flex flex-col items-center justify-center bg-slate-950/60 p-6 rounded-2xl border border-slate-855 text-center space-y-3">
                        <span className="text-6xl">{currentProfile.avatar}</span>
                        <div className="space-y-1">
                          <h4 className="text-3xl font-black text-indigo-400 font-mono tracking-wider">{results.code}</h4>
                          <p className="text-base font-extrabold text-white">{currentProfile.name}</p>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{currentProfile.categoryName} 组群</span>
                        </div>
                      </div>

                      {/* Right: Scores layout bars */}
                      <div className="md:col-span-8 space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 tracking-wider">维度平衡极性比率 (Polarities)</h4>
                        
                        {/* E vs I */}
                        <div className="space-y-1 text-[11px]">
                          <div className="flex justify-between font-bold">
                            <span className={results.E >= 50 ? "text-indigo-400" : "text-slate-500"}>外向 (E) {results.E}%</span>
                            <span className={results.I >= 50 ? "text-indigo-400" : "text-slate-500"}>内向 (I) {results.I}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden flex">
                            <div className="h-full bg-indigo-500" style={{ width: `${results.E}%` }}></div>
                            <div className="h-full bg-slate-800" style={{ width: `${results.I}%` }}></div>
                          </div>
                        </div>

                        {/* N vs S */}
                        <div className="space-y-1 text-[11px]">
                          <div className="flex justify-between font-bold">
                            <span className={results.N >= 50 ? "text-indigo-400" : "text-slate-500"}>直觉 (N) {results.N}%</span>
                            <span className={results.S >= 50 ? "text-indigo-400" : "text-slate-500"}>实感 (S) {results.S}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden flex">
                            <div className="h-full bg-indigo-500" style={{ width: `${results.N}%` }}></div>
                            <div className="h-full bg-slate-800" style={{ width: `${results.S}%` }}></div>
                          </div>
                        </div>

                        {/* F vs T */}
                        <div className="space-y-1 text-[11px]">
                          <div className="flex justify-between font-bold">
                            <span className={results.F >= 50 ? "text-indigo-400" : "text-slate-500"}>情感 (F) {results.F}%</span>
                            <span className={results.T >= 50 ? "text-indigo-400" : "text-slate-500"}>理智 (T) {results.T}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden flex">
                            <div className="h-full bg-indigo-500" style={{ width: `${results.F}%` }}></div>
                            <div className="h-full bg-slate-800" style={{ width: `${results.T}%` }}></div>
                          </div>
                        </div>

                        {/* J vs P */}
                        <div className="space-y-1 text-[11px]">
                          <div className="flex justify-between font-bold">
                            <span className={results.J >= 50 ? "text-indigo-400" : "text-slate-500"}>计划 (J) {results.J}%</span>
                            <span className={results.P >= 50 ? "text-indigo-400" : "text-slate-500"}>随性 (P) {results.P}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden flex">
                            <div className="h-full bg-indigo-500" style={{ width: `${results.J}%` }}></div>
                            <div className="h-full bg-slate-800" style={{ width: `${results.P}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Profiles description content */}
                    <div className="space-y-6">
                      {/* Summary */}
                      <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl leading-relaxed text-slate-350 italic text-sm">
                        “ {currentProfile.summary} ”
                      </div>

                      {/* Traits */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-1.5">✦ 人格典型标签</h4>
                        <div className="flex flex-wrap gap-2">
                          {currentProfile.traits.map((t, idx) => (
                            <span key={idx} className="bg-slate-950 text-slate-350 border border-slate-850 text-xs px-2.5 py-1 rounded-full font-medium">#{t}</span>
                          ))}
                        </div>
                      </div>

                      {/* Strengths and weaknesses */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="p-4 rounded-xl bg-emerald-950/10 border border-emerald-500/20 space-y-2">
                          <h5 className="text-xs font-bold text-emerald-400">典型优势</h5>
                          <ul className="text-xs text-slate-350 leading-relaxed list-disc list-inside space-y-1">
                            {currentProfile.strengths.map((str, idx) => (
                              <li key={idx}>{str}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-4 rounded-xl bg-rose-950/10 border border-rose-500/20 space-y-2">
                          <h5 className="text-xs font-bold text-rose-400">潜在盲点</h5>
                          <ul className="text-xs text-slate-350 leading-relaxed list-disc list-inside space-y-1">
                            {currentProfile.weaknesses.map((wk, idx) => (
                              <li key={idx}>{wk}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Career Suggestions */}
                      <div className="p-4 rounded-xl bg-indigo-950/10 border border-indigo-500/20 space-y-2">
                        <h5 className="text-xs font-bold text-indigo-300">人格黄金职业轴线</h5>
                        <div className="flex flex-wrap gap-2">
                          {currentProfile.careerSuggestions.map((cr, idx) => (
                            <span key={idx} className="bg-slate-950/80 text-indigo-200 border border-slate-800 text-xs px-2.5 py-1 rounded-lg font-bold">{cr}</span>
                          ))}
                        </div>
                      </div>

                      {/* Growth advice */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-indigo-300 tracking-wide uppercase">✦ 心理成长突破方略</h4>
                        <div className="space-y-2">
                          {currentProfile.growthAdvice.map((adv, idx) => (
                            <p key={idx} className="text-xs text-slate-350 bg-slate-950/30 border border-slate-850 rounded-lg p-3 leading-relaxed">
                              <span className="font-bold text-indigo-400 mr-1.5">建议 {idx + 1}:</span>{adv}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom actions */}
                    <div className="pt-6 border-t border-slate-800/40 flex flex-col sm:flex-row gap-3 justify-between items-center">
                      <button
                        onClick={resetQuiz}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-4 py-2 hover:bg-slate-800/40 rounded-lg transition"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> 返回测验大厅
                      </button>
                      <button
                        onClick={() => {
                          setConsultSystem("MBTI");
                          setConsultType(`${currentProfile.code} - ${currentProfile.name}`);
                          setActiveTab("consultation");
                          setCustomProblem(`我已通过测评测算出为 MBTI 人格体系中的 ${currentProfile.code}型（${currentProfile.name}）。在生活中我经常会面临我的自我盲点和人格瓶颈（如上所得），作为AI心理疗愈师，您能给予我深度的人格剖析、瓶颈破局策略与核心心理对策吗？`);
                        }}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
                      >
                        <span>结合 {results.code} 结果，发起定制AI心理咨询</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              }

              {/* IF ENNEAGRAM COMPLETION */}
              if (selectedQuizType === "enneagram") {
                const results = calculateEnneagramScores();
                const dominantTypeInt = parseInt(results.dominantType, 10);
                const currentProfile = ENNEAGRAM_DATA[dominantTypeInt - 1] || ENNEAGRAM_DATA[0];

                return (
                  <div className="bg-slate-900/25 border border-slate-800/50 backdrop-blur-xl rounded-2xl shadow-xl p-6 sm:p-8 max-w-4xl mx-auto z-10 relative space-y-8">
                    <div className="text-center space-y-2 pb-4 border-b border-slate-800/40">
                      <div className="inline-block bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold px-3 py-1 rounded-full">测评结果生成</div>
                      <h3 className="text-2xl font-black text-white px-2">你的九型人格核心动机报告</h3>
                      <p className="text-xs text-slate-400 font-medium">根据 27 题动机锚点矩阵折算归类所得</p>
                    </div>

                    {/* Dominant type card */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-850 text-center flex flex-col items-center justify-center space-y-2 h-full">
                        <div className="w-16 h-16 bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center justify-center text-3xl font-black font-mono rounded-2xl shadow-inner">
                          {results.dominantType}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-lg font-black text-white">{currentProfile.name}</h4>
                          <span className="text-[10px] text-slate-400 font-bold block">{currentProfile.groupName}</span>
                          <span className="text-xs text-slate-500 font-serif block italic">{currentProfile.englishName}</span>
                        </div>
                      </div>

                      {/* Display of scores on all 9 types */}
                      <div className="md:col-span-8 bg-slate-950/30 border border-slate-850/40 p-4 rounded-xl space-y-3">
                        <h4 className="text-[11px] font-bold text-slate-400 tracking-wider">九型特质倾向比率 (Full Profiles)</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {Object.entries(results.scores).map(([type, pct]) => (
                            <div key={type} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-900 flex justify-between items-center text-xs">
                              <span className="text-slate-400 truncate">#{type}型: <strong className="text-slate-200">{type === results.dominantType ? "【主导】" : ""}</strong></span>
                              <span className="font-mono font-bold text-purple-400">{pct}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Details of dominant type */}
                    <div className="space-y-6">
                      {/* Summary */}
                      <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl leading-relaxed text-slate-350 italic text-sm">
                        “ {currentProfile.summary} ”
                      </div>

                      {/* Core Motivations */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-rose-950/10 border border-rose-500/20 rounded-xl space-y-1">
                          <h4 className="text-xs font-bold text-rose-400">潜意识恐惧 (Core Fear)</h4>
                          <p className="text-xs text-slate-300 leading-relaxed font-semibold">{currentProfile.scaredOf}</p>
                        </div>
                        <div className="p-4 bg-blue-950/10 border border-blue-500/20 rounded-xl space-y-1">
                          <h4 className="text-xs font-bold text-blue-400">潜意识欲望 (Core Desire)</h4>
                          <p className="text-xs text-slate-300 leading-relaxed font-semibold">{currentProfile.desires}</p>
                        </div>
                      </div>

                      {/* Strengths & blindspots */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="p-4 rounded-xl bg-emerald-950/10 border border-emerald-500/20 space-y-2">
                          <h5 className="text-xs font-bold text-emerald-400">典型光芒优势</h5>
                          <ul className="text-xs text-slate-350 leading-relaxed list-disc list-inside space-y-1">
                            {currentProfile.strengths.map((str, idx) => (
                              <li key={idx}>{str}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-4 rounded-xl bg-rose-950/10 border border-rose-500/20 space-y-2">
                          <h5 className="text-xs font-bold text-rose-400">心智盲点软肋</h5>
                          <ul className="text-xs text-slate-350 leading-relaxed list-disc list-inside space-y-1">
                            {currentProfile.weaknesses.map((wk, idx) => (
                              <li key={idx}>{wk}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Self growth cultivation points */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-purple-300 tracking-wide uppercase">✦ 主导人格核心心灵修行路线</h4>
                        <div className="space-y-2">
                          {currentProfile.growthAdvice.map((adv, idx) => (
                            <p key={idx} className="text-xs text-slate-350 bg-slate-950/30 border border-slate-850 rounded-lg p-3 leading-relaxed">
                              <span className="font-bold text-purple-400 mr-1.5">修行点 {idx + 1}:</span>{adv}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom actions */}
                    <div className="pt-6 border-t border-slate-800/40 flex flex-col sm:flex-row gap-3 justify-between items-center">
                      <button
                        onClick={resetQuiz}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-4 py-2 hover:bg-slate-800/40 rounded-lg transition"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> 返回测验大厅
                      </button>
                      <button
                        onClick={() => {
                          setConsultSystem("Enneagram");
                          setConsultType(`第 ${currentProfile.id} 型 - ${currentProfile.name.split('：')[1]}`);
                          setActiveTab("consultation");
                          setCustomProblem(`我已通过测评测算出为主导人格九型体系中的第${currentProfile.id}型（${currentProfile.name.split('：')[1]}）。在修行和工作中，我深刻体验到了我的潜意识动机恐惧，也饱受我的盲点障碍（如上所得）。作为AI心理疗愈师，您能结合九型人格，深度指点我如何跨越自我防备、突破人格局限吗？`);
                        }}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
                      >
                        <span>结合 #{results.dominantType} 型，寻找AI深度分析</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              }

              {/* IF BIG FIVE COMPLETION */}
              const results = calculateBigFiveScores();
              const formattedResults = `【大五特质光谱为】：开放性 ${results.O}%, 尽责性 ${results.C}%, 外向性 ${results.E}%, 宜人性 ${results.A}%, 情绪不稳定性 ${results.N}%`;
              const bigFiveChartDataExpanded = [
                { name: "开放性 (O)", score: results.O, fill: "#3b82f6" },
                { name: "尽责性 (C)", score: results.C, fill: "#10b981" },
                { name: "外向性 (E)", score: results.E, fill: "#f59e0b" },
                { name: "宜人性 (A)", score: results.A, fill: "#ec4899" },
                { name: "神经质 (N)", score: results.N, fill: "#8b5cf6" }
              ];

              return (
                <div className="bg-slate-900/25 border border-slate-800/50 backdrop-blur-xl rounded-2xl shadow-xl p-6 sm:p-8 max-w-4xl mx-auto z-10 relative space-y-8 animate-fadeIn">
                  <div className="text-center space-y-2 pb-4 border-b border-slate-800/40">
                    <div className="inline-block bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full">测评结果生成</div>
                    <h3 className="text-2xl font-black text-white px-2">你的学术大五特质光谱报告</h3>
                    <p className="text-xs text-slate-400 font-medium">依据大五 25 题高阶心理因子折算归纳所得</p>
                  </div>

                  {/* Visual Chart */}
                  <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800/40 flex flex-col items-center">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">核心特质得分光谱比率 (OCEAN)</h4>
                    <div className="w-full h-64 sm:h-80 select-none">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={bigFiveChartDataExpanded} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                          <Tooltip formatter={(value) => [`${value}% 强度`, '特质强度']} contentStyle={{backgroundColor: '#05070a', border: '1px solid #1e293b', borderRadius: '8px'}} />
                          <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={40}>
                            {bigFiveChartDataExpanded.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-5 gap-2 w-full mt-2 text-center text-[10px] font-mono font-bold text-slate-500">
                      <div>开放性: {results.O}%</div>
                      <div>尽责性: {results.C}%</div>
                      <div>外向性: {results.E}%</div>
                      <div>宜人性: {results.A}%</div>
                      <div>情绪不稳: {results.N}%</div>
                    </div>
                  </div>

                  {/* Diagnostic details matrix */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-indigo-400" /> 特质光谱因子深度诊断书
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(results).map(([dim, scoreVal]) => {
                        const diagnosis = getTraitDescription(dim, scoreVal);
                        
                        let cardStyle = "bg-slate-900/30 border-slate-800 text-slate-300";
                        if (dim === 'O') cardStyle = "bg-indigo-950/10 border-indigo-500/20 text-slate-300";
                        if (dim === 'C') cardStyle = "bg-emerald-950/10 border-emerald-500/20 text-slate-300";
                        if (dim === 'E') cardStyle = "bg-blue-950/10 border-blue-500/20 text-slate-350";
                        if (dim === 'A') cardStyle = "bg-purple-950/10 border-purple-500/20 text-slate-300";
                        if (dim === 'N') cardStyle = "bg-rose-950/10 border-rose-500/20 text-slate-300";

                        return (
                          <div key={dim} className={`p-5 rounded-xl border ${cardStyle} space-y-2`}>
                            <div className="flex justify-between items-center w-full">
                              <h5 className="font-bold text-sm tracking-tight text-white">{diagnosis.title}</h5>
                              <span className="font-mono text-xs font-bold bg-slate-950 border border-slate-800 text-indigo-300 px-2 py-0.5 rounded-md shadow-xs">{scoreVal}%</span>
                            </div>
                            <p className="text-xs leading-relaxed text-slate-400">{diagnosis.text}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row gap-3 justify-between items-center">
                    <button
                      onClick={resetQuiz}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-4 py-2 hover:bg-slate-800/40 rounded-lg transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> 返回测验大厅
                    </button>
                    <button
                      onClick={() => {
                        setConsultSystem("BigFive");
                        setConsultType(formattedResults);
                        setActiveTab("consultation");
                        setCustomProblem(`我已通过测评测算出我的学术大五特质光谱比率（OCEAN）：开放性 ${results.O}%, 尽责性 ${results.C}%, 外向性 ${results.E}%, 宜人性 ${results.A}%, 情绪不稳定性(神经质) ${results.N}%。作为AI心理师，您能深度探秘在这种特质倾向组合下我容易产生的心灵内耗和处事硬核特征，并定制出一套系统的心理调适对策吗？`);
                      }}
                      className="bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
                    >
                      <span>根据大五光谱得分，发起AI定制心理咨询</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 3: AI CONSULTATION CLIENT */}
        {activeTab === "consultation" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900/40 border border-indigo-900/30 rounded-2xl p-6 text-slate-200 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="relative z-10 max-w-2xl">
                <span className="bg-indigo-500/25 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border border-indigo-500/20">AI 精神疗愈室</span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-3 bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-indigo-300">定制化心理辅导与人格瓶颈拆解</h2>
                <p className="mt-2 text-slate-400 text-sm leading-relaxed">
                  在这里，我们集成心理动力学和临床心理专家级视角。无论你是拖延受难、职场茫然、还是饱受完美主义或社恐内耗。它都将为你梳理情绪，定制心理练习。
                </p>
              </div>
            </div>

            {/* Split layout: Selector Panel (Left/Top) vs Chat Session Panel (Right/Bottom) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* SELECTOR & QUICK ASSISTANCE OPTIONS PANEL */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Type Selection Box */}
                <div className="bg-slate-900/25 border border-slate-800/50 backdrop-blur-xl rounded-2xl shadow-xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-indigo-300 border-b border-slate-800/40 pb-3 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-indigo-400" /> 第一步：确认你的人格
                  </h3>

                  {/* Personality System Toggle */}
                  <div className="space-y-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-bold block">选择人格体系：</label>
                      <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-900">
                        <button
                          type="button"
                          onClick={() => {
                            setConsultSystem("MBTI");
                            setConsultType("INFJ - 提倡者");
                          }}
                          className={`py-1.5 rounded-md font-medium text-center transition cursor-pointer ${
                            consultSystem === "MBTI" ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 shadow-xs" : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          MBTI
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setConsultSystem("Enneagram");
                            setConsultType("第 1 型 - 完美主义者");
                          }}
                          className={`py-1.5 rounded-md font-medium text-center transition cursor-pointer ${
                            consultSystem === "Enneagram" ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 shadow-xs" : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          九型人格
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setConsultSystem("BigFive");
                            setConsultType("大五特质光谱均衡倾向");
                          }}
                          className={`py-1.5 rounded-md font-medium text-center transition cursor-pointer ${
                            consultSystem === "BigFive" ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 shadow-xs" : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          大五人格
                        </button>
                      </div>
                    </div>

                    {/* Specific selection drop option */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-bold block">具体类型 / 得分：</label>
                      {consultSystem === "MBTI" && (
                        <select
                          value={consultType}
                          onChange={(e) => setConsultType(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-slate-300 font-medium focus:ring-1 focus:ring-indigo-500 outline-none"
                        >
                          {MBTI_DATA.map((item) => (
                            <option key={item.id} value={`${item.code} - ${item.name}`} className="bg-slate-950 text-slate-300">
                              {item.code} {item.name} ({item.categoryName})
                            </option>
                          ))}
                        </select>
                      )}

                      {consultSystem === "Enneagram" && (
                        <select
                          value={consultType}
                          onChange={(e) => setConsultType(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-slate-300 font-medium focus:ring-1 focus:ring-indigo-500 outline-none"
                        >
                          {ENNEAGRAM_DATA.map((item) => (
                            <option key={item.id} value={`第 ${item.id} 型 - ${item.name.split('：')[1]}`} className="bg-slate-950 text-slate-300">
                              第 {item.id} 型：{item.name.split('：')[1]} ({item.groupName})
                            </option>
                          ))}
                        </select>
                      )}

                      {consultSystem === "BigFive" && (
                        <input
                          type="text"
                          value={consultType}
                          onChange={(e) => setConsultType(e.target.value)}
                          placeholder="例如: 开放性 80%, 尽责性 40%"
                          className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-slate-200 font-bold focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Preset Psychology Problems Selection Box */}
                <div className="bg-slate-900/25 border border-slate-800/50 backdrop-blur-xl rounded-2xl shadow-xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-indigo-300 border-b border-slate-800/40 pb-3 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-indigo-400" /> 快捷心理议题
                  </h3>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">点击以下最契合你现状的痛点瓶颈，向AI发起心理剖析：</p>
                  
                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                    {PRESET_PROBLEMS.map((prob, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickQuestion(prob.presetQuestion)}
                        className="w-full p-2.5 rounded-xl border border-slate-850 bg-slate-950/40 hover:bg-indigo-950/20 hover:border-indigo-500/30 transition text-left space-y-1 block cursor-pointer"
                      >
                        <p className="text-xs font-bold text-slate-200 flex items-center justify-between">
                          <span>{prob.title}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                        </p>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{prob.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ACTIVE CHAT SESSION PANE */}
              <div className="lg:col-span-8 bg-slate-900/25 border border-slate-800/50 backdrop-blur-xl rounded-2xl shadow-xl flex flex-col h-[650px] overflow-hidden">
                {/* Chat header area */}
                <div className="px-6 py-4 border-b border-slate-800/40 bg-slate-950/40 flex justify-between items-center sm:flex-row flex-col gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse"></div>
                    <div>
                      <h4 className="text-sm font-bold text-white">心理分析会话</h4>
                      <div className="text-[10px] text-slate-400 font-semibold truncate max-w-sm sm:max-w-md">
                        当前会话身份：<span className="text-indigo-400 font-bold">[{consultSystem}] {consultType}</span>
                      </div>
                    </div>
                  </div>

                  {chatMessages.length > 0 && (
                    <button
                      onClick={clearChatHistory}
                      className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-rose-950/30 transition border border-rose-900/25 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> 清空历史
                    </button>
                  )}
                </div>

                {/* Messages scroll window */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto py-20">
                      <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 rounded-full flex items-center justify-center shadow-inner">
                        <MessageSquare className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-200">开启你的个人疗愈</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                          请在左上方确认你的人格型号，并点击常用议题或在下方自选输入你的内耗/情感阻滞障碍，AI深度心理师将通过专属的性格疗愈路线帮助你。
                        </p>
                      </div>
                    </div>
                  ) : (
                    chatMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex gap-3 max-w-[90%] sm:max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                      >
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs shadow-xs border ${
                          msg.role === "user" 
                            ? "bg-indigo-650 text-indigo-50 border-indigo-500/30" 
                            : "bg-purple-950/60 text-purple-300 border-purple-800/30"
                        }`}>
                          {msg.role === "user" ? "Me" : "AI"}
                        </div>

                        {/* Content text */}
                        <div className="space-y-1">
                          <div className={`p-4 rounded-2xl shadow-xs border ${
                            msg.role === "user"
                              ? "bg-indigo-950/40 text-slate-205 border-indigo-900/30 rounded-tr-none"
                              : "bg-slate-950/60 text-slate-300 border-slate-850/60 rounded-tl-none leading-relaxed"
                          }`}>
                            {msg.role === "user" ? (
                              <p className="text-xs whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            ) : (
                              <div className="markdown-body text-xs prose prose-slate max-w-none text-slate-200 leading-relaxed font-sans">
                                <Markdown>{msg.content}</Markdown>
                              </div>
                            )}
                          </div>
                          <p className={`text-[9px] font-medium text-slate-500 font-mono ${msg.role === "user" ? "text-right" : "text-left"}`}>
                            {msg.timestamp}
                          </p>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Typing placeholder animation when model is calculating */}
                  {loadingAnalysis && (
                    <div className="flex gap-3 max-w-[80%] mr-auto">
                      <div className="w-8 h-8 rounded-lg bg-purple-955/60 text-purple-300 flex items-center justify-center shrink-0 text-xs border border-purple-800/30">
                        AI
                      </div>
                      <div className="p-4 bg-slate-950/30 border border-slate-850/60 rounded-2xl rounded-tl-none flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                        <span className="text-xs text-slate-450 font-medium font-sans">心理学家正在深度解析您的人格模式，并拟定治疗方案...</span>
                      </div>
                    </div>
                  )}

                  {/* Error Notification Banner */}
                  {apiError && (
                    <div className="p-4 bg-rose-950/20 rounded-xl border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <Info className="w-4 h-4 text-rose-455 shrink-0" />
                      <div className="font-semibold font-sans">分析失败：{apiError}。您的 Gemini API 金钥可能正在启动中，请稍后再试。</div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Question Inputs Box bottom */}
                <div className="p-4 bg-slate-955/40 border-t border-slate-800/40">
                  <form onSubmit={handleConsultRequest} className="flex gap-2">
                    <input
                      type="text"
                      value={customProblem}
                      onChange={(e) => setCustomProblem(e.target.value)}
                      placeholder={`以 [${consultType.split(' - ')[0]}] 人格输入对您的问题、内耗、困惑作答描述...`}
                      disabled={loadingAnalysis}
                      className="flex-1 bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-xs placeholder-slate-550 focus:outline-none focus:border-indigo-500 font-medium text-slate-200"
                    />
                    <button
                      type="submit"
                      disabled={loadingAnalysis || !customProblem.trim()}
                      className={`px-5 py-3 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 shadow-md cursor-pointer ${
                        customProblem.trim() && !loadingAnalysis
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
                          : "bg-slate-800 cursor-not-allowed text-slate-500"
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>咨询</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-500 text-xs py-8 border-t border-slate-900 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-2 rounded-lg font-black text-xs">PSY</span>
            <div>
              <p className="font-bold text-slate-300">人格与心理研究所</p>
              <p className="text-[10px] text-slate-650">Psychology, Psychometrics & AI Counsel Space</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-600 text-center sm:text-right font-medium">
            基于 MBTI, Enneagram 和 Big Five 理论构建 ✦ 本系统由 Gemini 心理大模型诊断技术提供支持
          </p>
        </div>
      </footer>
    </div>
  );
}
