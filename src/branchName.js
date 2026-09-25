const STOPWORDS = new Set([
  'a', 'an', 'the', 'of', 'for', 'and', 'to', 'in', 'on', 'with', 'from',
  'or', 'vs', 'via', 'is', 'are', 'be', 'as', 'by', 'this', 'that', 'it',
])

// Common ticket vocabulary written as a noun ("Removal", "Enhancement")
// collapses to the shorter verb a developer would actually type in a
// branch name ("remove", "enhance").
const NORMALIZE = {
  removal: 'remove',
  deletion: 'delete',
  creation: 'create',
  addition: 'add',
  enhancement: 'enhance',
  modification: 'modify',
  tokenization: 'tokenize',
  implementation: 'implement',
  migration: 'migrate',
  integration: 'integrate',
  configuration: 'configure',
  validation: 'validate',
  optimization: 'optimize',
  correction: 'correct',
  generation: 'generate',
  cancellation: 'cancel',
  verification: 'verify',
  registration: 'register',
  authentication: 'auth',
  authorization: 'authorize',
  restoration: 'restore',
  replacement: 'replace',
  extension: 'extend',
  reduction: 'reduce',
  expansion: 'expand',
  activation: 'activate',
  deactivation: 'deactivate',
  automation: 'automate',
  updation: 'update',
}

function sanitizeWord(word) {
  return word.replace(/[^a-zA-Z0-9]/g, '')
}

// A leading "Type: ..." label (Enhancement:, Bug:, Story:, ...) is ticket
// metadata, not part of the change itself, so it's dropped before extracting
// keywords.
function stripTypeLabel(task) {
  const colonIndex = task.indexOf(':')
  return colonIndex === -1 ? task : task.slice(colonIndex + 1)
}

export function extractKeywords(task) {
  return stripTypeLabel(task || '')
    .split(/[^a-zA-Z0-9]+/)
    .map((word) => word.toLowerCase())
    .filter((word) => word.length > 2 && !STOPWORDS.has(word))
    .map((word) => NORMALIZE[word] || word)
}

// Three ranked candidates - the same keywords at increasing lengths - so
// picking a branch name is a choice between "short" and "more descriptive"
// rather than a single take-it-or-leave-it guess.
const CANDIDATE_LENGTHS = [2, 3, 4]

export function getBranchSuggestions({ username, cardNumber, task }) {
  const cleanUsername = sanitizeWord(username || '').toLowerCase() || 'dev'
  const cleanCard = String(cardNumber || '').replace(/[^a-zA-Z0-9]/g, '')
  const keywords = extractKeywords(task)

  const suffixes = []
  const seen = new Set()
  for (const length of CANDIDATE_LENGTHS) {
    if (keywords.length === 0) break
    const suffix = keywords.slice(0, Math.min(length, keywords.length)).join('-')
    if (seen.has(suffix)) continue
    seen.add(suffix)
    suffixes.push(suffix)
  }

  if (suffixes.length === 0) {
    return [cleanCard ? `${cleanUsername}/${cleanCard}` : `${cleanUsername}/`]
  }

  return suffixes.map((suffix) => {
    const tail = [cleanCard, suffix].filter(Boolean).join('-')
    return `${cleanUsername}/${tail}`
  })
}
