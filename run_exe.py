"""
Entry point for the PyInstaller-built exe.
No installs needed — everything is bundled.
Shows clear progress so the customer knows what's happening.
"""

import sys
import socket
import threading
import webbrowser
import time


def status(msg: str, end: str = "\n") -> None:
    print(f"  {msg}", end=end, flush=True)


def _local_ip() -> str:
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


def main() -> None:
    print()
    print("  ======================================")
    print("    Crack Detection System v2.0")
    print("  ======================================")
    print()

    status("Loading detection model...  ", end="")
    # This import triggers model load inside DetectionEngine.__init__
    from backend.app import app  # noqa: F811
    print("done")

    host = "0.0.0.0"
    port = 8000
    local_ip = _local_ip()

    def _open_browser():
        time.sleep(1.5)
        webbrowser.open(f"http://127.0.0.1:{port}")

    threading.Thread(target=_open_browser, daemon=True).start()

    status("Starting server...  done")
    print()
    print(f"  Local:   http://127.0.0.1:{port}")
    print(f"  Network: http://{local_ip}:{port}")
    print()
    print(f"  Your browser should open automatically.")
    print(f"  Close this window to stop the application.")
    print()

    import uvicorn
    uvicorn.run(app, host=host, port=port, log_level="warning")


if __name__ == "__main__":
    import multiprocessing
    multiprocessing.freeze_support()
    main()
