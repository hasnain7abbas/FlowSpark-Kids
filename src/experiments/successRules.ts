import type { Experiment, SimulationMetrics, ToolId, ToolUseCounts } from '../types'

export const createToolUseCounts = (): ToolUseCounts => ({
  water: 0,
  pollution: 0,
  rock: 0,
  wall: 0,
  tree: 0,
  fan: 0,
  smoke: 0,
  heater: 0,
  ice: 0,
  filter: 0,
  drain: 0,
  rain: 0,
})

export const countToolUse = (
  counts: ToolUseCounts,
  toolId: ToolId,
): ToolUseCounts => ({
  ...counts,
  [toolId]: counts[toolId] + 1,
})

export const evaluateSuccess = (
  experiment: Experiment,
  counts: ToolUseCounts,
  metrics: SimulationMetrics,
) => {
  switch (experiment.id) {
    case 'river':
      return (
        counts.water > 0 &&
        counts.drain > 0 &&
        (metrics.waterInOcean > 10 || counts.rock + counts.wall > 0)
      )
    case 'flood':
      return (
        counts.rain > 0 &&
        counts.tree + counts.wall + counts.rock >= 2 &&
        counts.drain > 0
      )
    case 'pollution':
      return counts.pollution > 0 && counts.water > 0 && metrics.pollutionRemaining > 25
    case 'filter':
      return counts.pollution > 0 && counts.filter > 0 && counts.water > 0
    case 'wind':
      return counts.smoke > 0 && counts.fan > 0 && metrics.smokeToRight > 12
    case 'heat':
      return (
        counts.smoke > 0 &&
        counts.heater > 0 &&
        counts.ice > 0 &&
        (metrics.warmRising > 4 || metrics.cooledSinking > 2)
      )
    case 'rock':
      return counts.water > 0 && counts.rock > 0
    default:
      return false
  }
}
