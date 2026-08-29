"""Small dependency-free PDF builder for final student results."""
from io import BytesIO


def _escape(value: object) -> str:
    return str(value).replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def build_result_pdf(
    school_name: str,
    student_name: str,
    student_number: str,
    grade_level: str,
    section: str,
    academic_year: str,
    subjects: list[dict],
    total: float,
    overall_average: float,
    overall_grade: str,
) -> bytes:
    lines = [
        school_name,
        "FINAL STUDENT RESULT",
        f"Student Name: {student_name}",
        f"Student Number: {student_number}",
        f"Grade: {grade_level}    Section: {section}",
        f"Academic Year: {academic_year}",
        "",
        "Subject                         Average       Grade",
        "----------------------------------------------------",
    ]
    for subject in subjects:
        lines.append(f"{subject['subject_name'][:28]:28} {subject['average']:>8.2f}       {subject['grade']}")
    lines += [
        "----------------------------------------------------",
        f"Total: {total:.2f}",
        f"Overall Average: {overall_average:.2f}",
        f"Overall Grade: {overall_grade}",
        "",
        "This report contains only grades approved by the class head.",
    ]

    stream_parts = ["BT", "/F1 11 Tf", "50 790 Td"]
    for index, line in enumerate(lines):
        if index:
            stream_parts.append("0 -18 Td")
        stream_parts.append(f"({_escape(line)}) Tj")
    stream_parts.append("ET")
    stream = "\n".join(stream_parts).encode("latin-1", "replace")

    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"\nendstream",
    ]

    pdf = BytesIO(b"%PDF-1.4\n")
    offsets = [0]
    for number, obj in enumerate(objects, 1):
        offsets.append(pdf.tell())
        pdf.write(f"{number} 0 obj\n".encode())
        pdf.write(obj)
        pdf.write(b"\nendobj\n")
    xref = pdf.tell()
    pdf.write(f"xref\n0 {len(objects) + 1}\n".encode())
    pdf.write(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.write(f"{offset:010d} 00000 n \n".encode())
    pdf.write(f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF".encode())
    return pdf.getvalue()
