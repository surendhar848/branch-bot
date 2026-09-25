const STOPWORDS = new Set([
  'a', 'an', 'the', 'of', 'for', 'and', 'to', 'in', 'on', 'with', 'from', 'or', 'vs', 'via',
])

function sanitizeWord(word) {
  return word.replace(/[^a-zA-Z0-9]/g, '')
}

function significantWords(segment) {
  return segment
    .split(/\s+/)
    .map(sanitizeWord)
    .filter(Boolean)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word.toLowerCase()))
}

// Short, deterministic abbreviation for one "-"-delimited chunk of the task
// description. Exactly two significant words combine as a 4-char lead word
// plus a 3-char second word (e.g. "Tata Capital" -> "TataCap"); any other
// word count just truncates the leading word to 5 chars (e.g. "Tokenized
// Link Creation" -> "Token"), keeping every segment short and skimmable.
function abbreviateSegment(segment) {
  const words = significantWords(segment)
  if (words.length === 0) return ''
  if (words.length === 2) return words[0].slice(0, 4) + words[1].slice(0, 3)
  return words[0].slice(0, 5)
}

export function getSegmentBreakdown(task) {
  return (task || '')
    .split(/\s*-\s*/)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => ({ segment, abbreviation: abbreviateSegment(segment) }))
    .filter((entry) => entry.abbreviation)
}

export function generateBranchName({ username, cardNumber, task }) {
  const cleanUsername = sanitizeWord(username || '').toLowerCase() || 'dev'
  const cleanCard = String(cardNumber || '').replace(/[^a-zA-Z0-9]/g, '')
  const suffix = getSegmentBreakdown(task)
    .map((entry) => entry.abbreviation)
    .join('-')

  const tail = [cleanCard, suffix].filter(Boolean).join('-')
  return tail ? `${cleanUsername}/${tail}` : `${cleanUsername}/`
}
