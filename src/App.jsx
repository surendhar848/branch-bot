import { useEffect, useMemo, useState } from 'react'
import { extractKeywords, getBranchSuggestions } from './branchName.js'

const EXAMPLE_TASK = 'Enhancement: Removal SFL Pincode in the Code'

export default function App() {
  const [username, setUsername] = useState('surendhar')
  const [cardNumber, setCardNumber] = useState('')
  const [task, setTask] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [copied, setCopied] = useState(false)

  const isReady = cardNumber.trim() !== '' && task.trim() !== ''

  const suggestions = useMemo(
    () => getBranchSuggestions({ username, cardNumber, task }),
    [username, cardNumber, task],
  )

  const keywords = useMemo(() => extractKeywords(task), [task])

  // Whenever the inputs change the candidate list is rebuilt from scratch,
  // so the previous selection index may no longer point at the same idea.
  useEffect(() => {
    setSelectedIndex(0)
  }, [username, cardNumber, task])

  const safeIndex = Math.min(selectedIndex, suggestions.length - 1)
  const selected = suggestions[safeIndex]

  async function handleCopy() {
    if (!isReady) return
    try {
      await navigator.clipboard.writeText(selected)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // clipboard access denied by the browser; the text is still selectable
    }
  }

  return (
    <div className="crt">
      <div className="scanlines" aria-hidden="true" />

      <header className="masthead">
        <h1>
          <span className="prompt">$</span> branch-bot<span className="cursor">_</span>
        </h1>
        <p className="tagline">turn a card number and a task into a branch name you won't misspell twice.</p>
      </header>

      <main className="layout">
        <section className="panel form-panel">
          <label className="field">
            <span className="label-tag">01_username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="surendhar"
              autoComplete="off"
              spellCheck={false}
            />
          </label>

          <label className="field">
            <span className="label-tag">02_card_number</span>
            <input
              value={cardNumber}
              onChange={(event) => setCardNumber(event.target.value)}
              placeholder="12344"
              autoComplete="off"
              spellCheck={false}
            />
          </label>

          <label className="field">
            <span className="label-tag">03_task_details</span>
            <textarea
              value={task}
              onChange={(event) => setTask(event.target.value)}
              placeholder={EXAMPLE_TASK}
              rows={4}
              spellCheck={false}
            />
          </label>

          <p className="hint">
            a leading <code>Type:</code> label is dropped, filler words are skipped, and
            what's left is kept as real words - not chopped into random letters.
          </p>
        </section>

        <section className="panel preview-panel">
          <span className="label-tag">pick a branch name</span>

          {keywords.length > 0 && (
            <p className="keywords">
              detected:{' '}
              {keywords.map((word, index) => (
                <span key={`${word}-${index}`} className="keyword-chip">
                  {word}
                </span>
              ))}
            </p>
          )}

          <ul className="suggestion-list">
            {isReady ? (
              suggestions.map((suggestion, index) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    className={`suggestion ${index === safeIndex ? 'is-selected' : ''}`}
                    onClick={() => setSelectedIndex(index)}
                  >
                    <span className="suggestion-marker">{index === safeIndex ? '◉' : '○'}</span>
                    <span className="suggestion-text">{suggestion}</span>
                  </button>
                </li>
              ))
            ) : (
              <li className="suggestion-empty">waiting_for_input...</li>
            )}
          </ul>

          <button className="copy-button" onClick={handleCopy} disabled={!isReady}>
            {copied ? 'copied' : 'copy selected'}
          </button>
        </section>
      </main>

      <footer className="masthead-footer">
        <span className="prompt">$</span> git checkout -b {isReady ? selected : '...'}
      </footer>
    </div>
  )
}
