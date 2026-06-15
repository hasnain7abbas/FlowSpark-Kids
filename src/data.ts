import {
  BrickWall,
  CloudRain,
  Droplet,
  Fan,
  Filter,
  Flame,
  IceCreamBowl,
  Leaf,
  Pickaxe,
  Radiation,
  Tornado,
  Waves,
} from 'lucide-react'
import type { ComponentType } from 'react'
import type { Experiment, Tool, ToolId } from './types'

export const tools: Tool[] = [
  {
    id: 'water',
    name: 'Water',
    tip: 'Add clean water and watch it spread.',
    observation: 'Clean water is flowing outward from the drop.',
    color: 'blue',
  },
  {
    id: 'pollution',
    name: 'Pollution',
    tip: 'Add a dirty drop to see how pollution travels.',
    observation: 'The purple pollution is spreading into nearby water.',
    color: 'purple',
  },
  {
    id: 'rock',
    name: 'Rock',
    tip: 'Place a rock to split the flow.',
    observation: 'The rock blocks the path, so water moves around it.',
    color: 'stone',
  },
  {
    id: 'wall',
    name: 'Wall',
    tip: 'Build a barrier that redirects water.',
    observation: 'The wall changed the direction of the flow.',
    color: 'stone',
  },
  {
    id: 'tree',
    name: 'Tree',
    tip: 'Trees slow water near their roots.',
    observation: 'The tree roots are slowing water nearby.',
    color: 'green',
  },
  {
    id: 'fan',
    name: 'Fan',
    tip: 'Push air and smoke toward the right.',
    observation: 'The fan is pushing the air in one direction.',
    color: 'yellow',
  },
  {
    id: 'smoke',
    name: 'Smoke',
    tip: 'Make invisible air movement easier to see.',
    observation: 'Smoke makes the moving air visible.',
    color: 'purple',
  },
  {
    id: 'heater',
    name: 'Heater',
    tip: 'Warm nearby air so it moves upward.',
    observation: 'Warm air is rising above the heater.',
    color: 'red',
  },
  {
    id: 'ice',
    name: 'Ice',
    tip: 'Cool nearby flow so it sinks.',
    observation: 'The cooler flow is moving downward.',
    color: 'blue',
  },
  {
    id: 'filter',
    name: 'Filter',
    tip: 'Place a filter to clean dirty water.',
    observation: 'The filter catches some dirty particles as water passes.',
    color: 'green',
  },
  {
    id: 'drain',
    name: 'Drain',
    tip: 'Pull water toward one collection point.',
    observation: 'Water is being pulled toward the drain.',
    color: 'stone',
  },
  {
    id: 'rain',
    name: 'Rain',
    tip: 'Make a small rain cloud over the table.',
    observation: 'Rain is adding many little drops at once.',
    color: 'blue',
  },
]

export const toolIcons: Record<ToolId, ComponentType<{ size?: number; strokeWidth?: number }>> = {
  water: Droplet,
  pollution: Radiation,
  rock: Pickaxe,
  wall: BrickWall,
  tree: Leaf,
  fan: Fan,
  smoke: Tornado,
  heater: Flame,
  ice: IceCreamBowl,
  filter: Filter,
  drain: Waves,
  rain: CloudRain,
}

export const experiments: Experiment[] = [
  {
    id: 'river',
    title: 'Make a River',
    goal: 'Help water travel from the mountain to the ocean.',
    prompt: 'Can you guide the water across?',
    steps: 'Add water near the mountain. Use rocks or walls to shape its path.',
    science: 'Water follows a path and changes direction when something blocks it.',
    teacherNote:
      'Ask students to predict the route before placing each obstacle. Compare a straight path with a winding path.',
    vocabulary: ['flow', 'path', 'obstacle'],
  },
  {
    id: 'flood',
    title: 'Stop the Flood',
    goal: 'Protect the tiny village from heavy rain.',
    prompt: 'What can slow the rainwater?',
    steps: 'Make rain, then add trees, walls, and a drain before water spreads.',
    science: 'Trees and barriers can slow water and help reduce flooding.',
    teacherNote:
      'Discuss how roots hold soil and how drains give rainwater a safer place to go.',
    vocabulary: ['rain', 'flood', 'barrier'],
  },
  {
    id: 'pollution',
    title: 'Dirty Water Spreads',
    goal: 'See how pollution moves through water.',
    prompt: 'How far will one dirty drop travel?',
    steps: 'Add clean water, then place one pollution drop and stir gently.',
    science: 'Pollution can travel far away from the place where it started.',
    teacherNote:
      'Connect the model to litter, oil, and chemicals entering streams after rainfall.',
    vocabulary: ['pollution', 'spread', 'source'],
  },
  {
    id: 'filter',
    title: 'Clean the Pond',
    goal: 'Use filters to make dirty water cleaner.',
    prompt: 'Where should the filter go?',
    steps: 'Add pollution and water. Place a filter across the moving flow.',
    science: 'Filters catch some particles while water moves through them.',
    teacherNote:
      'Explain that real water treatment uses several cleaning steps, not only one filter.',
    vocabulary: ['filter', 'particle', 'clean'],
  },
  {
    id: 'wind',
    title: 'See the Wind',
    goal: 'Use smoke to see how air moves.',
    prompt: 'Can smoke reveal the air?',
    steps: 'Add smoke, then place a fan and a wall. Watch the smoke change path.',
    science: 'Air is invisible, but we can see its movement when it carries smoke.',
    teacherNote:
      'Invite students to name other clues that air is moving, such as flags or leaves.',
    vocabulary: ['air', 'wind', 'direction'],
  },
  {
    id: 'heat',
    title: 'Hot Air Rises',
    goal: 'Warm the air and watch where it goes.',
    prompt: 'Which way will warm air move?',
    steps: 'Add smoke above a heater, then compare it with smoke near an ice block.',
    science: 'Warm air usually rises while cooler air moves downward.',
    teacherNote:
      'Relate the motion to warm air above a radiator and cool air near the floor.',
    vocabulary: ['heat', 'warm', 'cool'],
  },
  {
    id: 'rock',
    title: 'Around the Rock',
    goal: 'Place rocks and watch water move around them.',
    prompt: 'Can one rock split a stream?',
    steps: 'Add a few water drops, place rocks in the path, then drag to stir.',
    science: 'Flow changes direction when it meets an obstacle.',
    teacherNote:
      'Compare one large rock with several small rocks and discuss the different patterns.',
    vocabulary: ['flow', 'rock', 'direction'],
  },
]
