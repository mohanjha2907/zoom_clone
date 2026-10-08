import random
import string

def generate_meeting_code() -> str:
    """Generates a human-readable meeting code like '123-456-7890'."""
    parts = [
        ''.join(random.choices(string.digits, k=3)),
        ''.join(random.choices(string.digits, k=3)),
        ''.join(random.choices(string.digits, k=4))
    ]
    return '-'.join(parts)

def generate_invite_link(meeting_code: str) -> str:
    """Generates a full invite link for the meeting."""
    base_url = "http://localhost:3000" # Assuming frontend runs on localhost:3000
    return f"{base_url}/join/{meeting_code}"

def generate_passcode() -> str:
    """Generates a 6-digit alphanumeric passcode."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
