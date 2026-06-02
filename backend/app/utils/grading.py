"""
Grading utility.
Converts a numeric score (0–100) into a letter grade using the school's scale.

Scale:
  90–100  → A+
  85–89   → A
  80–84   → A-
  75–79   → B+
  70–74   → B
  65–69   → B-
  60–64   → C+
  50–59   → C
  40–49   → D
   0–39   → F

This is the SINGLE source of truth for grade calculation.
It is called by the Grade model and the API route — never calculated inline.
"""

from __future__ import annotations


# Ordered from highest to lowest — first match wins.
_SCALE: list[tuple[int, str]] = [
    (90, "A+"),
    (85, "A"),
    (80, "A-"),
    (75, "B+"),
    (70, "B"),
    (65, "B-"),
    (60, "C+"),
    (50, "C"),
    (40, "D"),
    (0,  "F"),
]


def calculate_grade_letter(score: float) -> str:
    """
    Return the letter grade for a given numeric score.

    Args:
        score: A float between 0 and 100 (inclusive).

    Returns:
        Letter grade string, e.g. "A+", "B-", "F".

    Raises:
        ValueError: if score is outside the 0–100 range.

    Examples:
        >>> calculate_grade_letter(95)
        'A+'
        >>> calculate_grade_letter(85)
        'A'
        >>> calculate_grade_letter(72)
        'B'
        >>> calculate_grade_letter(39)
        'F'
        >>> calculate_grade_letter(40)
        'D'
    """
    if not (0 <= score <= 100):
        raise ValueError(f"Score must be between 0 and 100, got {score}.")

    for threshold, letter in _SCALE:
        if score >= threshold:
            return letter

    return "F"  # safety fallback — unreachable given validation above
