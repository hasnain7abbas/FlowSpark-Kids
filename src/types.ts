export type ToolId =
  | 'water'
  | 'pollution'
  | 'rock'
  | 'wall'
  | 'tree'
  | 'fan'
  | 'smoke'
  | 'heater'
  | 'ice'
  | 'filter'
  | 'drain'
  | 'rain'

export type ToolColor =
  | 'blue'
  | 'purple'
  | 'stone'
  | 'green'
  | 'yellow'
  | 'red'

export interface Tool {
  id: ToolId
  name: string
  tip: string
  observation: string
  color: ToolColor
}

export interface Experiment {
  id: string
  title: string
  goal: string
  prompt: string
  steps: string
  science: string
  successMessage: string
  teacherNote: string
  vocabulary: string[]
}

export interface Observation {
  id: number
  text: string
  tone: 'ready' | 'noted' | 'success'
}

export type ToolUseCounts = Record<ToolId, number>

export interface SimulationMetrics {
  waterInOcean: number
  pollutionRemaining: number
  smokeToRight: number
  warmRising: number
  cooledSinking: number
}
