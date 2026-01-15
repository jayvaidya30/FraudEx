import re

def compute_risk_score(text: str) -> tuple[int, dict, str]:
    """
    Computes a risk score (0-100) based on heuristics.
    Returns: (score, signals_dict, explanation)
    """
    signals = {}
    score = 0
    explanation_parts = []

    lower_text = text.lower()

    # 1. Keywords
    suspicious_keywords = ["bribe", "kickback", "undisclosed", "off-book", "cash", "facilitation"]
    found_keywords = [w for w in suspicious_keywords if w in lower_text]
    if found_keywords:
        signals["keywords"] = found_keywords
        score += 20 * len(found_keywords)
        explanation_parts.append(f"Found suspicious keywords: {', '.join(found_keywords)}.")

    # 2. Round Numbers (Simplistic heuristic)
    # Regex to find large round numbers like 50000, 100,000 etc.
    round_numbers = re.findall(r"\b\d+000\b", text.replace(",", ""))
    if len(round_numbers) > 2:
        signals["round_numbers"] = round_numbers[:5]
        score += 15
        explanation_parts.append("Multiple large round numbers detected, which can indicate estimates or artificial pricing.")

    # 3. Urgency
    if "immediate" in lower_text or "urgent" in lower_text:
        score += 10
        signals["urgency"] = True
        explanation_parts.append("Urgent language detected.")

    # Cap score
    score = min(score, 100)

    # Explanation
    if score == 0:
        explanation = "No specific corruption risk indicators detected by heuristic analysis."
    else:
        explanation = " ".join(explanation_parts)

    return score, signals, explanation
