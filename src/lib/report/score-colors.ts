export type ScoreStyle = {
  level: string;
  color: string;
  bgColor: string;
  textColor: string;
  barColor: string;
};

export function getScoreStyle(score: number): ScoreStyle {
  if (score >= 80) {
    return {
      level: "优秀",
      color: "#0fbc8c",
      bgColor: "#E1F5EE",
      textColor: "#085041",
      barColor: "#0fbc8c",
    };
  }

  if (score >= 60) {
    return {
      level: "良好",
      color: "#378ADD",
      bgColor: "#E6F1FB",
      textColor: "#0C447C",
      barColor: "#378ADD",
    };
  }

  if (score >= 40) {
    return {
      level: "待优化",
      color: "#EF9F27",
      bgColor: "#FAEEDA",
      textColor: "#854F0B",
      barColor: "#EF9F27",
    };
  }

  return {
    level: "偏弱",
    color: "#E24B4A",
    bgColor: "#FCEBEB",
    textColor: "#791F1F",
    barColor: "#E24B4A",
  };
}
