const calculatePoints = (round) => {
  switch (round) {
    case 1:
      return 1;
    case 2:
      return 5;
    case 3:
      return {
        firstAttempt: 30,
        secondAttempt: 20,
        thirdAttempt: 10,
        failed: 0,
      };
    default:
      throw new Error("Invalid round number");
  }
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
