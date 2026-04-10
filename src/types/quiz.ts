import { CriterionData, ScorecardTemplate } from "../components/ScorecardPickerDialog";

export interface QuizEditorHandle {
    saveDraft: () => Promise<void>;
    savePublished: () => Promise<void>;
    cancel: () => void;
    hasContent: () => boolean;
    hasChanges: () => boolean;
    hasQuestionContent: () => boolean;
    getCurrentQuestionType: () => 'objective' | 'subjective' | null;
    getCurrentQuestionInputType: () => 'text' | 'code' | 'audio' | null;
    hasCorrectAnswer: () => boolean;
    hasCodingLanguages: () => boolean;
    hasScorecard: () => boolean;
    setActiveTab: (tab: 'question' | 'answer' | 'scorecard' | 'knowledge') => void;
    validateBeforePublish: () => boolean;
    getCurrentQuestionConfig: () => QuizQuestionConfig | undefined;
    validateScorecardCriteria: (
        scorecard: ScorecardTemplate | undefined, 
        callbacks: {
            setActiveTab: (tab: 'question' | 'answer' | 'scorecard' | 'knowledge') => void;
            showErrorMessage?: (title: string, message: string, emoji?: string) => void;
            questionIndex?: number;
        }
    ) => boolean;
    hasUnsavedScorecardChanges: () => boolean;
    handleScorecardChangesRevert: () => void;
}

export interface QuizQuestionConfig {
    inputType: 'text' | 'code' | 'audio';
    responseType: 'chat' | 'exam';
    correctAnswer?: any[];
    codingLanguages?: string[]; // For multiple coding languages
    questionType: 'objective' | 'subjective';
    scorecardData?: ScorecardTemplate;
    knowledgeBaseBlocks: any[]; // Add knowledge base content blocks
    linkedMaterialIds: string[]; // Add IDs of linked learning materials
    title: string;
    settings?: any;
}

export interface QuizQuestion {
    id: string;
    content: any[];
    config: QuizQuestionConfig;
}

export interface QuizEditorProps {
    initialQuestions?: QuizQuestion[]; // Kept for backward compatibility but not used anymore
    onChange?: (questions: QuizQuestion[]) => void;
    className?: string;
    isPreviewMode?: boolean;
    readOnly?: boolean;
    onPublish?: () => void;
    taskId?: string;
    status?: string;
    onPublishSuccess?: (updatedData?: any) => void;
    showPublishConfirmation?: boolean;
    onPublishCancel?: () => void;
    isEditMode?: boolean;
    onSaveSuccess?: (updatedData?: any) => void;
    taskType?: 'quiz';
    currentQuestionId?: string;
    onQuestionChange?: (questionId: string) => void;
    onSubmitAnswer?: (questionId: string, answer: string) => void;
    schoolId?: string; // ID of the school for fetching school-specific scorecards
    onValidationError?: (message: string, description: string) => void; // Function to handle validation errors
    courseId?: string; // ID of the course for fetching learning materials
    scheduledPublishAt?: string | null;
    onQuestionChangeWithUnsavedScorecardChanges?: () => void;
}

export interface ScorecardCriterion {
    name: string;
    description: string;
    min_score: number;
    max_score: number;
    pass_score: number;
}

// Define the API response question interface
export interface APIQuestionResponse {
    id: number;
    title: string;
    blocks: any[];
    answer?: string;
    type: string;
    input_type: string;
    response_type: string;
    scorecard_id?: number;
    scorecard?: {
        id: number;
        title: string;
        criteria: {
            id: number;
            name: string;
            description: string;
            min_score: number;
            max_score: number;
            pass_score: number
        }[];
    };
    context?: {
        blocks?: any[];
        linkedMaterialIds?: string[];
    };
    coding_languages?: string[];
    settings?: any;
}

export interface FeedbackEvidence {
    type: 'code_line' | 'test_case' | 'quote' | 'reasoning_gap';
    reference: string;
    description: string;
}

export interface CriterionFeedbackItem {
    criterion_name: string;
    score: number;
    max_score: number;
    pass_score: number;
    evidence: FeedbackEvidence[];
    improvement_areas?: string;
    next_step: string;
    severity: 'low' | 'medium' | 'high';
}

export interface FeedbackOutput {
    feedback_summary: string;
    criteria: CriterionFeedbackItem[];
    overall_score: number;
    attempt_id?: number;
    surfaced_criteria?: CriterionFeedbackItem[];
}

export interface FeedbackCriterionDiff {
    criterion_name: string;
    previous_score?: number;
    current_score: number;
    change: 'improved' | 'regressed' | 'unchanged' | 'new';
}

export interface FeedbackAttemptSummary {
    attempt_id: number;
    overall_score: number;
    feedback_summary: string;
    created_at: string;
}


// Define a message type for the chat history
export interface ChatMessage {
    id: string;
    content: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    messageType?: 'text' | 'audio' | 'code' | 'file';
    audioData?: string; // base64 encoded audio data
    scorecard?: ScorecardItem[]; // Add scorecard field for detailed feedback
    feedbackOutput?: FeedbackOutput;
    attemptId?: number;
    diffFromPrevious?: FeedbackCriterionDiff[];
    isError?: boolean;
    is_correct?: boolean; // Add is_correct attribute for exam responses
    fileUuid?: string; // UUID for file messages
    fileName?: string; // Filename for file messages
}   


// Define scorecard item structure
export interface ScorecardItem {
    category: string;
    feedback: {
        correct: string;
        wrong: string;
    };
    score: number;
    max_score: number;
    pass_score: number;
    evidence?: FeedbackEvidence[];
    next_step?: string;
    severity?: 'low' | 'medium' | 'high';
}

export interface AIResponse {
    feedback: string;
    is_correct: boolean;
    scorecard?: ScorecardItem[];
    feedback_output?: FeedbackOutput;
    attempt_id?: number;
    diff_from_previous?: FeedbackCriterionDiff[];
}
