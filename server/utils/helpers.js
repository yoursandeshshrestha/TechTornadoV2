const calculatePoints = (round, attempts, isCorrect) => {
  if (!isCorrect) return 0;

  if (round === 3) {
    switch (attempts) {
      case 1:
        return 30;
      case 2:
        return 20;
      case 3:
        return 10;
      default:
        return 0;
    }
  }

  return round === 1 ? 1 : 5;
};

const getRoundDuration = (round) => {
  switch (round) {
    case 1:
      return 30 * 60 * 1000; // 30 minutes
    case 2:
      return 40 * 60 * 1000; // 40 minutes
    case 3:
      return 60 * 60 * 1000; // 60 minutes
    default:
      return 30 * 60 * 1000;
  }
};

module.exports = {
  calculatePoints,
  getRoundDuration,
};
