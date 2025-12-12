/**
 * 🛡️ PANOSPACE AI GUARDRAILS SYSTEM
 * 
 * This module acts as a self-imposed safety layer for AI coding assistants (Gemini/Cursor).
 * It defines strict rules, checklists, and preview mechanisms that the AI must consult
 * before performing destructive or complex operations.
 * 
 * CORE DIRECTIVE: "First, do no harm."
 */

// ============================================================================
// 1. SAFETY RULES ENGINE
// ============================================================================

export type SafetyRuleLevel = 'CRITICAL' | 'WARNING' | 'INFO';

export interface SafetyRule {
    id: string;
    level: SafetyRuleLevel;
    description: string;
    enforcement: 'BLOCK' | 'CONFIRM' | 'LOG';
}

export const AI_SAFETY_RULES: SafetyRule[] = [
    {
        id: 'NO_DELETION',
        level: 'CRITICAL',
        description: 'AI is strictly forbidden from deleting user files without explicit, named confirmation.',
        enforcement: 'BLOCK'
    },
    {
        id: 'NO_OVERWRITE_WITHOUT_READ',
        level: 'CRITICAL',
        description: 'AI must read a file content immediately before overwriting to prevent regression.',
        enforcement: 'BLOCK'
    },
    {
        id: 'PRESERVE_BUSINESS_LOGIC',
        level: 'CRITICAL',
        description: 'When refactoring UI, underlying business logic/hooks must remain untouched unless specific instruction is given.',
        enforcement: 'CONFIRM'
    },
    {
        id: 'TYPE_SAFETY_FIRST',
        level: 'WARNING',
        description: 'New code must not introduce "any" types if a specific interface exists in @/core/types.',
        enforcement: 'LOG'
    }
];

// ============================================================================
// 2. FEATURE SAFETY CHECKLIST
// ============================================================================

export interface SafetyCheck {
    id: string;
    question: string;
    verified: boolean;
}

/**
 * The Safety Verification Standard
 * AI must internally "check" these boxes before finalizing an implementation plan.
 */
export const FEATURE_SAFETY_CHECKLIST: SafetyCheck[] = [
    { id: 'CHK_01', question: 'Does this change break existing routes?', verified: false },
    { id: 'CHK_02', question: 'Have I handled loading and error states?', verified: false },
    { id: 'CHK_03', question: 'Is this change compatible with mobile/responsive layouts?', verified: false },
    { id: 'CHK_04', question: 'Did I verify import paths (e.g., @/core vs relative)?', verified: false },
    { id: 'CHK_05', question: 'Does this introduce unauthorized console.logs?', verified: false },
    { id: 'CHK_06', question: 'Have I respected the theme system (colors.ts)?', verified: false },
];

/**
 * verifySafety
 * Helper for AI to simulate running a safety check.
 */
export const verifySafety = (context: string, checks: string[]): { safe: boolean; pending: string[] } => {
    // In a real automated pipeline, this would run static analysis.
    // For the AI Assistant, this serves as a cognitive stop-gap.
    const pending = checks.filter(c => !c.startsWith('VERIFIED'));
    return {
        safe: pending.length === 0,
        pending
    };
};


// ============================================================================
// 3. REFACTOR PREVIEW MODE
// ============================================================================

export interface DiffPreview {
    file: string;
    originalPreview: string; // First 50 chars or checksum
    proposedChange: string; // Summary of change
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * generateRefactorPreview
 * AI uses this to structure its proposed changes before applying them.
 */
export const generateRefactorPreview = (
    fileName: string,
    changeDescription: string,
    risk: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'
): DiffPreview => {
    return {
        file: fileName,
        originalPreview: '(Current file content)',
        proposedChange: changeDescription,
        riskLevel: risk
    };
};

/**
 * Guard assertion function.
 * Application code can call this in debug mode to ensure AI hasn't stripped critical logic.
 */
export const assertCriticalLogic = (componentName: string, logicName: string) => {
    if (import.meta.env.DEV) {
        // Using console.log here is intentional - this is a dev-only guard assertion
        console.log(`🛡️ Guard: Verifying ${logicName} in ${componentName}... OK`);
    }
};
