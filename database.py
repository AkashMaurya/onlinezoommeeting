import sqlite3
from datetime import datetime
from typing import List, Dict, Optional
import threading

class Database:
    """SQLite database manager for meeting platform"""
    
    def __init__(self, db_name: str = "meetings.db"):
        self.db_name = db_name
        self.local = threading.local()
        self._init_db()
    
    def _get_connection(self):
        """Get thread-local database connection"""
        if not hasattr(self.local, 'conn'):
            self.local.conn = sqlite3.connect(self.db_name, check_same_thread=False)
            self.local.conn.row_factory = sqlite3.Row
        return self.local.conn
    
    def _init_db(self):
        """Initialize database tables"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        # Create meetings table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS meetings (
                meeting_id TEXT PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                participant_count INTEGER DEFAULT 0
            )
        """)
        
        # Create participants table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS participants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                meeting_id TEXT NOT NULL,
                participant_id TEXT NOT NULL,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (meeting_id) REFERENCES meetings(meeting_id),
                UNIQUE(meeting_id, participant_id)
            )
        """)
        
        # Create indexes for better performance
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_participants_meeting 
            ON participants(meeting_id)
        """)
        
        conn.commit()
    
    def create_meeting(self, meeting_id: str) -> bool:
        """Create a new meeting"""
        try:
            conn = self._get_connection()
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO meetings (meeting_id, participant_count) VALUES (?, 0)",
                (meeting_id,)
            )
            conn.commit()
            return True
        except sqlite3.IntegrityError:
            return False
    
    def meeting_exists(self, meeting_id: str) -> bool:
        """Check if a meeting exists"""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT 1 FROM meetings WHERE meeting_id = ?",
            (meeting_id,)
        )
        return cursor.fetchone() is not None
    
    def add_participant(self, meeting_id: str, participant_id: str) -> bool:
        """Add a participant to a meeting"""
        try:
            conn = self._get_connection()
            cursor = conn.cursor()
            
            # Insert participant
            cursor.execute(
                "INSERT INTO participants (meeting_id, participant_id) VALUES (?, ?)",
                (meeting_id, participant_id)
            )
            
            # Update participant count
            cursor.execute(
                "UPDATE meetings SET participant_count = participant_count + 1 WHERE meeting_id = ?",
                (meeting_id,)
            )
            
            conn.commit()
            return True
        except sqlite3.IntegrityError:
            return False
    
    def remove_participant(self, meeting_id: str, participant_id: str) -> bool:
        """Remove a participant from a meeting"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "DELETE FROM participants WHERE meeting_id = ? AND participant_id = ?",
            (meeting_id, participant_id)
        )
        
        if cursor.rowcount > 0:
            cursor.execute(
                "UPDATE meetings SET participant_count = participant_count - 1 WHERE meeting_id = ?",
                (meeting_id,)
            )
            conn.commit()
            return True
        return False
    
    def get_participants(self, meeting_id: str) -> List[str]:
        """Get all participants in a meeting"""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT participant_id FROM participants WHERE meeting_id = ?",
            (meeting_id,)
        )
        return [row[0] for row in cursor.fetchall()]
    
    def get_participant_count(self, meeting_id: str) -> int:
        """Get the number of participants in a meeting"""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT participant_count FROM meetings WHERE meeting_id = ?",
            (meeting_id,)
        )
        result = cursor.fetchone()
        return result[0] if result else 0
    
    def cleanup_old_meetings(self, hours: int = 24):
        """Remove meetings older than specified hours"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            """
            DELETE FROM participants WHERE meeting_id IN (
                SELECT meeting_id FROM meetings 
                WHERE created_at < datetime('now', '-' || ? || ' hours')
            )
            """,
            (hours,)
        )
        
        cursor.execute(
            "DELETE FROM meetings WHERE created_at < datetime('now', '-' || ? || ' hours')",
            (hours,)
        )
        
        conn.commit()

