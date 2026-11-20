import json
from pathlib import Path
from datetime import datetime


class ActivityService:

    ACTIVITY_DIR  = Path(__file__).parent.parent / "activity"
    ACTIVITY_FILE = ACTIVITY_DIR / "activity.json"

    def __init__(self):
        self.ACTIVITY_DIR.mkdir(exist_ok=True)

        if not self.ACTIVITY_FILE.exists():
            with open(self.ACTIVITY_FILE, "w", encoding="utf-8") as f:
                json.dump([], f)

    def load(self) -> list:
        with open(self.ACTIVITY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)

    def save(self, activities: list) -> None:
        with open(self.ACTIVITY_FILE, "w", encoding="utf-8") as f:
            json.dump(activities, f, indent=4, ensure_ascii=False)

    def add(self, activity_type: str, message: str) -> None:
        activities = self.load()
        activities.insert(0, {
            "type":      activity_type,
            "message":   message,
            "timestamp": datetime.now().isoformat(),
        })
        activities = activities[:100]   # keep last 100 entries
        self.save(activities)

    def recent(self, limit: int = 10) -> list:
        return self.load()[:limit]
