import { useMemo, useState } from 'react'
import { generateBranchName, getSegmentBreakdown } from './branchName.js'

const EXAMPLE_TASK = 'Tata Capital PL - Tokenized Link Creation'

export default function App() {
  const [username, setUsername] = useState('surendhar')
  const [cardNumber, setCardNumber] = useState('')
  const [task, setTask] = useState('')
  const [copied, setCopied] = useState(false)

  const isReady = cardNumber.trim() !== '' && task.trim() !== ''

  const branchName = useMemo(
    () => generateBranchName({ username, cardNumber, task }),
    [username, cardNumber, task],
  )

  const breakdown = useMemo(() => getSegmentBreakdown(task), [task])

  async function handleCopy() {
    if (!isReady) return
    try {
      await navigator.clipboard.writeText(branchName)
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
              placeholder="12144"
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
            separate a ticket type from its description with <code>-</code>, branch-bot
            abbreviates each chunk on its own.
          </p>
        </section>

        <section className="panel preview-panel">
          <span className="label-tag">branch_name</span>

          <div className={`branch-output ${isReady ? '' : 'is-empty'}`}>
            <span className="branch-text">
              {isReady ? branchName : 'waiting_for_input...'}
            </span>
            <span className="cursor">_</span>
          </div>

          <button className="copy-button" onClick={handleCopy} disabled={!isReady}>
            {copied ? 'copied' : 'copy'}
          </button>

          <div className="breakdown">
            <span className="label-tag">breakdown</span>
            {breakdown.length > 0 ? (
              <ul>
                {breakdown.map((entry, index) => (
                  <li key={`${entry.segment}-${index}`}>
                    <span className="chip-from">{entry.segment}</span>
                    <span className="arrow">&rarr;</span>
                    <span className="chip-to">{entry.abbreviation}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="hint">type a task above to see how each chunk gets shortened.</p>
            )}
          </div>
        </section>
      </main>

      <footer className="masthead-footer">
        <span className="prompt">$</span> git checkout -b {isReady ? branchName : '...'}
      </footer>
    </div>
  )
}
