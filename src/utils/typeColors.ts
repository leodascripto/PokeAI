export const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC'
};

export const TYPE_GRADIENTS: Record<string, string[]> = {
  normal: ['#A8A878', '#C5C5A0'],
  fire: ['#F08030', '#FF6B35'],
  water: ['#6890F0', '#4FC3F7'],
  electric: ['#F8D030', '#FFE082'],
  grass: ['#78C850', '#81C784'],
  ice: ['#98D8D8', '#B2EBF2'],
  fighting: ['#C03028', '#E57373'],
  poison: ['#A040A0', '#BA68C8'],
  ground: ['#E0C068', '#D4AF37'],
  flying: ['#A890F0', '#B39DDB'],
  psychic: ['#F85888', '#F48FB1'],
  bug: ['#A8B820', '#AED581'],
  rock: ['#B8A038', '#D4B863'],
  ghost: ['#705898', '#9575CD'],
  dragon: ['#7038F8', '#7986CB'],
  dark: ['#705848', '#8D6E63'],
  steel: ['#B8B8D0', '#B0BEC5'],
  fairy: ['#EE99AC', '#F8BBD9']
};

export const getTypeColor = (type: string): string => {
  return TYPE_COLORS[type.toLowerCase()] || '#68A090';
};

export const getTypeGradient = (type: string): string[] => {
  return TYPE_GRADIENTS[type.toLowerCase()] || ['#68A090', '#78B0A0'];
};