// SM-2 spaced repetition algorithm
// quality: 0-5 (0-1 = wrong, 2 = wrong but easy, 3 = correct barely, 4 = correct, 5 = perfect)

export interface SM2Card {
  repetitions: number;
  interval: number;    // days until next review
  easeFactor: number;  // default 2.5
}

export interface SM2Result extends SM2Card {
  nextReview: Date;
}

export function sm2(card: SM2Card, quality: 0 | 1 | 2 | 3 | 4 | 5): SM2Result {
  let { repetitions, interval, easeFactor } = card;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);

    repetitions++;
  } else {
    // Incorrect — reset
    repetitions = 0;
    interval = 1;
  }

  // Update ease factor (min 1.3)
  easeFactor = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  );

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return { repetitions, interval, easeFactor, nextReview };
}

export function isDue(nextReview: Date | null | undefined): boolean {
  if (!nextReview) return true;
  return new Date() >= new Date(nextReview);
}
