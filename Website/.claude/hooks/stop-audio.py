#!/usr/bin/env python3
"""
play_system_sound.py

Cross-platform "play a short system sound" helper.
- Windows: uses winsound + known system .wav
- macOS: uses afplay on a known .aiff; falls back to `say`
- Linux: tries paplay/aplay/ffplay and common sound theme files; falls back to terminal bell

Usage:
    python play_system_sound.py            # play default for this OS
    python play_system_sound.py /path/to/file.wav  # play a specific file if you prefer

Exit codes:
    0 = played successfully (or reasonable fallback like bell)
    1 = hard failure
"""

import os
import sys
import platform
import subprocess
import shutil
from pathlib import Path

def which(cmd: str) -> str | None:
    return shutil.which(cmd)

def try_run(cmd: list[str]) -> bool:
    try:
        # Use DEVNULL to keep CLI quiet
        with open(os.devnull, "wb") as devnull:
            subprocess.check_call(cmd, stdout=devnull, stderr=devnull)
        return True
    except Exception:
        return False

def pick_default_sound(system: str) -> Path | None:
    p = Path

    if system == "Windows":
        candidates = [
            p(r"C:\Windows\Media\Windows Notify.wav"),
            p(r"C:\Windows\Media\Windows Balloon.wav"),
            p(r"C:\Windows\Media\Alarm01.wav"),
        ]
        for c in candidates:
            if c.exists():
                return c
        return None

    if system == "Darwin":  # macOS
        candidates = [
            p("/System/Library/Sounds/Glass.aiff"),
            p("/System/Library/Sounds/Submarine.aiff"),
            p("/System/Library/Sounds/Pop.aiff"),
        ]
        for c in candidates:
            if c.exists():
                return c
        return None

    # Linux & everything else POSIX-like
    linux_candidates = [
        # Freedesktop/Ubuntu themes (paplay likes .oga/.ogg)
        p("/usr/share/sounds/freedesktop/stereo/complete.oga"),
        p("/usr/share/sounds/freedesktop/stereo/message.oga"),
        p("/usr/share/sounds/ubuntu/stereo/dialog-information.ogg"),
        # ALSA samples for aplay (wav)
        p("/usr/share/sounds/alsa/Front_Center.wav"),
        # speech-dispatcher test (wav)
        p("/usr/share/sounds/speech-dispatcher/test.wav"),
    ]
    for c in linux_candidates:
        if c.exists():
            return c
    return None

def play_file(path: Path) -> bool:
    """Try a few players appropriate to the file extension/OS."""
    system = platform.system()
    ext = path.suffix.lower()

    if system == "Windows":
        try:
            import winsound
            winsound.PlaySound(str(path), winsound.SND_FILENAME)
            return True
        except Exception:
            pass
        # Fallback to start (may open a UI player)
        return try_run(["powershell", "-NoProfile", "-Command", f'Start-Process -FilePath "{path}"'])

    if system == "Darwin":  # macOS
        if which("afplay"):
            return try_run(["afplay", str(path)])
        # fallback: QuickTime via 'open' (will show UI), or 'say' if no file
        if which("open"):
            return try_run(["open", str(path)])
        return False

    # Linux / other POSIX
    # Prefer paplay (PulseAudio/PipeWire), then aplay (ALSA), then ffplay
    if which("paplay"):
        return try_run(["paplay", str(path)])
    if which("aplay"):
        return try_run(["aplay", str(path)])
    if which("ffplay"):
        # -autoexit to quit when done, -nodisp to avoid window
        return try_run(["ffplay", "-autoexit", "-nodisp", str(path)])
    if which("play"):  # SoX
        return try_run(["play", "-q", str(path)])
    return False

def fallback_tone() -> bool:
    """Last-ditch: try to emit a short beep on the current platform."""
    system = platform.system()
    try:
        if system == "Windows":
            import winsound
            winsound.MessageBeep()
            return True
        elif system == "Darwin":
            # Speak a short chirp if no audio players are available
            if which("say"):
                return try_run(["say", "-v", "Boing", "boop"])
        else:
            # ANSI bell (works in some terminals)
            sys.stdout.write("\a")
            sys.stdout.flush()
            return True
    except Exception:
        pass
    return False

def main():
    # If a path is provided, try that first.
    if len(sys.argv) > 1:
        user_path = Path(sys.argv[1]).expanduser()
        if user_path.exists():
            if play_file(user_path):
                return 0
            if fallback_tone():
                return 0
            return 1
        else:
            print(f"File not found: {user_path}", file=sys.stderr)
            return 1

    system = platform.system()
    sound = pick_default_sound(system)

    # If we found a system sound, try to play it
    if sound and play_file(sound):
        return 0

    # If we couldn't play a file, try a platform-specific fallback
    if system == "Darwin" and which("say"):
        # make a tiny chirp without needing a file
        if try_run(["say", "ding"]):
            return 0

    if fallback_tone():
        return 0

    print("Unable to play any sound on this system.", file=sys.stderr)
    return 1

if __name__ == "__main__":
    raise SystemExit(main())
