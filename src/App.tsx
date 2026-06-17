import { useCallback, useMemo, useRef, useState } from 'react'
import {
  BookOpen,
  Camera,
  Check,
  ChevronRight,
  FlaskConical,
  GraduationCap,
  Lightbulb,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import './App.css'
import { experiments, toolIcons, tools } from './data'
import {
  countToolUse,
  createToolUseCounts,
  evaluateSuccess,
} from './experiments/successRules'
import { FluidCanvas, type FluidCanvasHandle } from './simulation/FluidCanvas'
import type { Experiment, Observation, SimulationMetrics, ToolId } from './types'

const starterObservations: Observation[] = [
  {
    id: 1,
    text: 'Your water table is ready. Add a drop or place something in its path.',
    tone: 'ready',
  },
]

const emptyMetrics: SimulationMetrics = {
  waterInOcean: 0,
  waterNearVillage: 0,
  pollutionRemaining: 0,
  smokeToRight: 0,
  warmRising: 0,
  cooledSinking: 0,
}

function App() {
  const [activeExperiment, setActiveExperiment] = useState<Experiment>(
    experiments[0],
  )
  const [selectedTool, setSelectedTool] = useState<ToolId>('water')
  const [teacherMode, setTeacherMode] = useState(false)
  const [observations, setObservations] =
    useState<Observation[]>(starterObservations)
  const [completed, setCompleted] = useState(false)
  const [toolUses, setToolUses] = useState(createToolUseCounts)
  const [metrics, setMetrics] = useState<SimulationMetrics>(emptyMetrics)
  const canvasRef = useRef<FluidCanvasHandle>(null)
  const observationId = useRef(2)

  const selectedToolData = useMemo(
    () => tools.find((tool) => tool.id === selectedTool) ?? tools[0],
    [selectedTool],
  )

  const addObservation = useCallback(
    (text: string, tone: Observation['tone'] = 'noted') => {
      setObservations((current) =>
        [
          { id: observationId.current++, text, tone },
          ...current,
        ].slice(0, 5),
      )
    },
    [],
  )

  const handleToolAction = useCallback(
    (toolId: ToolId) => {
      const tool = tools.find((item) => item.id === toolId)
      if (!tool) return

      addObservation(tool.observation)
    },
    [addObservation],
  )

  const checkSuccess = useCallback(
    (nextMetrics: SimulationMetrics, nextToolUses = toolUses) => {
      if (completed) return
      if (!evaluateSuccess(activeExperiment, nextToolUses, nextMetrics)) return

      setCompleted(true)
      addObservation(activeExperiment.successMessage, 'success')
    },
    [activeExperiment, addObservation, completed, toolUses],
  )

  const handleMetricsChange = useCallback(
    (nextMetrics: SimulationMetrics) => {
      setMetrics(nextMetrics)
      checkSuccess(nextMetrics)
    },
    [checkSuccess],
  )

  const registerToolAction = useCallback(
    (toolId: ToolId) => {
      handleToolAction(toolId)
      setToolUses((current) => {
        const nextToolUses = countToolUse(current, toolId)
        checkSuccess(metrics, nextToolUses)
        return nextToolUses
      })
    },
    [checkSuccess, handleToolAction, metrics],
  )

  const resetScene = () => {
    canvasRef.current?.reset()
    setToolUses(createToolUseCounts())
    setMetrics(emptyMetrics)
    setObservations(starterObservations)
    setCompleted(false)
  }

  const selectExperiment = (experiment: Experiment) => {
    setActiveExperiment(experiment)
    setCompleted(false)
    setToolUses(createToolUseCounts())
    setMetrics(emptyMetrics)
    canvasRef.current?.reset()
    setObservations([
      {
        id: observationId.current++,
        text: `${experiment.title} is ready. ${experiment.prompt}`,
        tone: 'ready',
      },
    ])
  }

  const takeScreenshot = () => {
    const dataUrl = canvasRef.current?.capture()
    if (!dataUrl) return

    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `flowspark-${activeExperiment.id}.png`
    link.click()
    addObservation('Snapshot saved. Scientists keep pictures of what they see.')
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#playground" aria-label="FlowSpark Kids home">
          <img src="/icon.svg" alt="" />
          <span>
            <strong>FlowSpark</strong>
            <small>KIDS LAB</small>
          </span>
        </a>

        <div className="experiment-heading">
          <span className="eyebrow">Today&apos;s experiment</span>
          <strong>{activeExperiment.title}</strong>
        </div>

        <div className="topbar-actions">
          <button className="icon-button" onClick={resetScene} type="button">
            <RotateCcw size={18} />
            <span>Reset</span>
          </button>
          <button className="icon-button" onClick={takeScreenshot} type="button">
            <Camera size={18} />
            <span>Snapshot</span>
          </button>
          <button
            className={`teacher-toggle ${teacherMode ? 'is-on' : ''}`}
            onClick={() => setTeacherMode((value) => !value)}
            type="button"
            aria-pressed={teacherMode}
          >
            <GraduationCap size={19} />
            <span>Teacher</span>
            <i aria-hidden="true" />
          </button>
        </div>
      </header>

      <section className="workspace" id="playground">
        <aside className="experiment-rail" aria-label="Experiments">
          <div className="rail-heading">
            <span className="rail-icon">
              <FlaskConical size={18} />
            </span>
            <div>
              <span className="eyebrow">Choose a mission</span>
              <h2>Experiment cards</h2>
            </div>
          </div>

          <div className="experiment-list">
            {experiments.map((experiment, index) => (
              <button
                className={`experiment-card ${
                  activeExperiment.id === experiment.id ? 'is-active' : ''
                }`}
                key={experiment.id}
                onClick={() => selectExperiment(experiment)}
                data-experiment-id={experiment.id}
                type="button"
              >
                <span className="experiment-number">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="experiment-copy">
                  <strong>{experiment.title}</strong>
                  <small>{experiment.goal}</small>
                </span>
                <ChevronRight size={17} />
              </button>
            ))}
          </div>
        </aside>

        <section className="play-area">
          <div className="mission-strip">
            <div className="mission-icon">
              <Sparkles size={20} />
            </div>
            <div>
              <span className="eyebrow">Your mission</span>
              <p>{activeExperiment.goal}</p>
            </div>
            <span className="mission-prompt">{activeExperiment.prompt}</span>
          </div>

          <div className="canvas-frame">
            <FluidCanvas
              ref={canvasRef}
              selectedTool={selectedTool}
              onToolAction={registerToolAction}
              onMetricsChange={handleMetricsChange}
            />
            <div className="canvas-label canvas-label--mountain">
              <span>Mountain spring</span>
            </div>
            <div className="canvas-label canvas-label--ocean">
              <span>Ocean</span>
            </div>
            <div className="canvas-hint">
              <span className="gesture-dot" />
              Click to add. Drag to stir the flow.
            </div>
            {completed && (
              <div className="success-toast" role="status">
                <span>
                  <Check size={18} strokeWidth={3} />
                </span>
                <div>
                  <strong>Mission complete!</strong>
                  <small>{activeExperiment.successMessage}</small>
                </div>
              </div>
            )}
          </div>

          <div className="toolbox">
            <div className="toolbox-heading">
              <span className="eyebrow">Pick a tool</span>
              <strong>{selectedToolData.tip}</strong>
            </div>
            <div className="tool-grid">
              {tools.map((tool) => {
                const Icon = toolIcons[tool.id]
                return (
                  <button
                    className={`tool-button tool-button--${tool.color} ${
                      selectedTool === tool.id ? 'is-selected' : ''
                    }`}
                    key={tool.id}
                    onClick={() => setSelectedTool(tool.id)}
                    type="button"
                    aria-pressed={selectedTool === tool.id}
                    data-tool-id={tool.id}
                    title={tool.tip}
                  >
                    <span>
                      <Icon size={22} strokeWidth={2.25} />
                    </span>
                    <small>{tool.name}</small>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <aside className="notebook">
          <div className="notebook-binding" aria-hidden="true">
            {Array.from({ length: 9 }).map((_, index) => (
              <i key={index} />
            ))}
          </div>
          <div className="notebook-header">
            <span className="notebook-mark">
              <BookOpen size={19} />
            </span>
            <div>
              <span className="eyebrow">My science notebook</span>
              <h2>Watch. Wonder. Learn.</h2>
            </div>
          </div>

          <article className="notebook-section challenge-note">
            <span className="note-label">Challenge</span>
            <h3>{activeExperiment.title}</h3>
            <p>{activeExperiment.steps}</p>
          </article>

          <article className="notebook-section observation-note">
            <span className="note-label">What happened?</span>
            <div className="observation-lens">
              <div className="lens-spark">*</div>
              <p>{observations[0]?.text}</p>
            </div>
          </article>

          <article className="notebook-section idea-note">
            <span className="idea-icon">
              <Lightbulb size={18} />
            </span>
            <div>
              <span className="note-label">Science idea</span>
              <p>{activeExperiment.science}</p>
            </div>
          </article>

          {teacherMode && (
            <article className="notebook-section teacher-note">
              <span className="note-label">Teacher notes</span>
              <p>{activeExperiment.teacherNote}</p>
              <div className="vocabulary">
                {activeExperiment.vocabulary.map((word) => (
                  <span key={word}>{word}</span>
                ))}
              </div>
            </article>
          )}

          <div className="observation-log">
            <span className="note-label">Observation log</span>
            {observations.slice(1, 4).map((observation) => (
              <p key={observation.id}>
                <i />
                {observation.text}
              </p>
            ))}
          </div>
        </aside>
      </section>
    </main>
  )
}

export default App
