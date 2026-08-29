"""Unit tests for academic grade validation and calculation."""

import pytest
from pydantic import ValidationError

from app.schemas.grade import GradeCreate, GradeUpdate
from app.utils.grading import calculate_grade_letter


def test_grade_create_rejects_score_above_max_score():
    with pytest.raises(ValidationError):
        GradeCreate(
            student_id="00000000-0000-0000-0000-000000000001",
            class_id="00000000-0000-0000-0000-000000000002",
            assessment_type="exam",
            term="Term 1",
            score=101,
            max_score=100,
        )


def test_grade_update_rejects_score_above_supplied_max_score():
    with pytest.raises(ValidationError):
        GradeUpdate(score=95, max_score=90)


def test_grade_update_allows_score_only_partial_update():
    payload = GradeUpdate(score=85)
    assert payload.score == 85
    assert payload.max_score is None


def test_grade_update_rejects_blank_term():
    with pytest.raises(ValidationError):
        GradeUpdate(term="   ")


@pytest.mark.parametrize(
    ("score", "expected"),
    [
        (100, "A+"),
        (90, "A+"),
        (89, "A"),
        (80, "A-"),
        (75, "B+"),
        (70, "B"),
        (60, "C+"),
        (50, "C"),
        (40, "D"),
        (39, "F"),
        (0, "F"),
    ],
)
def test_grade_letter_boundaries(score, expected):
    assert calculate_grade_letter(score) == expected


def test_grade_letter_rejects_out_of_range_score():
    with pytest.raises(ValueError):
        calculate_grade_letter(100.01)
    with pytest.raises(ValueError):
        calculate_grade_letter(-0.01)
