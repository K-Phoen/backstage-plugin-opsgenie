import stc from 'string-to-color';

export const colorForString = (() => {
  const preferredColors = [
    '#FF9830', // orange
    '#ff7452', // another orange
    '#F2495C', // red
    '#F2CC0C', // yellow
    '#00857A', // green
    '#5794F2', // blue
    '#144790', // another blue
    '#B877D9', // purple
    '#255637', // different green
    '#481D24', // brown-ish
    '#E56399', // pink-ish
  ];
  const namesMap: Record<string, string> = {};

  return (name: string): string => {
    if (namesMap[name]) {
      return namesMap[name];
    }

    if (preferredColors.length === 0) {
      return stc(name);
    }

    namesMap[name] = preferredColors.pop()!;

    return namesMap[name];
  };
})();
