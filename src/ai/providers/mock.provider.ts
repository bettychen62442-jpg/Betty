import {
  AIProvider,
  TranscriptionResult,
  ExtractedQuestion,
  AIProviderMetadata,
} from "../types";

// ── Mock Transcription ──────────────────────────────

const MOCK_TRANSCRIPT: TranscriptionResult = {
  fullText: `面试官：你好，请先做一个简单的自我介绍。
候选人：你好，我有5年的前端开发经验，主要使用React和TypeScript...

面试官：请解释一下JavaScript的闭包是什么？
候选人：闭包是指一个函数能够访问其外部作用域的变量，即使外部函数已经返回...

面试官：能写一个例子吗？
候选人：当然，比如创建一个计数器函数...

面试官：好的，那React的useEffect cleanup function是做什么的？
候选人：useEffect的清理函数在组件卸载前执行，或者在依赖变化导致effect重新执行前运行...

面试官：你有用过useMemo和useCallback吗？它们有什么区别？
候选人：useMemo缓存计算结果，useCallback缓存函数引用...

面试官：最后一个问题，请设计一个URL短链服务。
候选人：需要考虑几个方面，首先是API设计，用户传入长链接返回短链...`,
  segments: [
    { start: 0, end: 5, text: "面试官：你好，请先做一个简单的自我介绍。" },
    { start: 5, end: 12, text: "候选人：你好，我有5年的前端开发经验，主要使用React和TypeScript..." },
    { start: 12, end: 18, text: "面试官：请解释一下JavaScript的闭包是什么？" },
    { start: 18, end: 28, text: "候选人：闭包是指一个函数能够访问其外部作用域的变量..." },
    { start: 28, end: 32, text: "面试官：能写一个例子吗？" },
    { start: 32, end: 40, text: "候选人：当然，比如创建一个计数器函数..." },
    { start: 40, end: 46, text: "面试官：好的，那React的useEffect cleanup function是做什么的？" },
    { start: 46, end: 55, text: "候选人：useEffect的清理函数在组件卸载前执行..." },
    { start: 55, end: 62, text: "面试官：你有用过useMemo和useCallback吗？它们有什么区别？" },
    { start: 62, end: 72, text: "候选人：useMemo缓存计算结果，useCallback缓存函数引用..." },
    { start: 72, end: 80, text: "面试官：最后一个问题，请设计一个URL短链服务。" },
    { start: 80, end: 95, text: "候选人：需要考虑几个方面，首先是API设计..." },
  ],
  language: "zh",
};

// ── Mock Question Extraction ────────────────────────

const MOCK_EXTRACTED_QUESTIONS: ExtractedQuestion[] = [
  {
    questionText: "请解释一下JavaScript的闭包是什么？",
    answerText: "闭包是指一个函数能够访问其外部作用域的变量，即使外部函数已经返回...",
    context: "面试官：请解释一下JavaScript的闭包是什么？候选人：闭包是指...",
    suggestedCategory: "JavaScript",
    suggestedTags: ["closures"],
    suggestedDifficulty: 2,
    confidence: 0.95,
  },
  {
    questionText: "React的useEffect cleanup function是做什么的？",
    answerText: "useEffect的清理函数在组件卸载前执行，或者在依赖变化导致effect重新执行前运行...",
    context: "面试官：好的，那React的useEffect cleanup function是做什么的？...",
    suggestedCategory: "React",
    suggestedTags: ["react-hooks"],
    suggestedDifficulty: 2,
    confidence: 0.92,
  },
  {
    questionText: "useMemo和useCallback有什么区别？",
    answerText: "useMemo缓存计算结果，useCallback缓存函数引用...",
    context: "面试官：你有用过useMemo和useCallback吗？它们有什么区别？...",
    suggestedCategory: "React",
    suggestedTags: ["react-hooks", "performance"],
    suggestedDifficulty: 3,
    confidence: 0.88,
  },
  {
    questionText: "请设计一个URL短链服务",
    answerText: "需要考虑几个方面，首先是API设计，用户传入长链接返回短链...",
    context: "面试官：最后一个问题，请设计一个URL短链服务。...",
    suggestedCategory: "System Design",
    suggestedTags: ["system-design", "api-design"],
    suggestedDifficulty: 4,
    confidence: 0.91,
  },
];

// ── Mock Metadata ────────────────────────────────────

const MOCK_METADATA: AIProviderMetadata = {
  providerName: "mock",
  modelName: "mock-v1",
  latencyMs: 800,
};

// ── Mock Provider Implementation ────────────────────

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockProvider: AIProvider = {
  transcription: {
    name: "mock-transcriber",
    async transcribe(_buffer, _options) {
      await delay(1500); // Simulate processing time
      return {
        result: MOCK_TRANSCRIPT,
        metadata: { ...MOCK_METADATA, providerName: "mock-transcriber" },
      };
    },
  },
  questionExtraction: {
    name: "mock-extractor",
    async extractQuestions(_transcript, _options) {
      await delay(2000); // Simulate processing time
      return {
        questions: MOCK_EXTRACTED_QUESTIONS,
        metadata: { ...MOCK_METADATA, providerName: "mock-extractor" },
      };
    },
  },
};
