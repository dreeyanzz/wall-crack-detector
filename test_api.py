import urllib.request, urllib.parse, json, time, threading

def api(method, path, body=None):
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"} if body else {}
    req = urllib.request.Request(
        f"http://127.0.0.1:8000/api{path}", data=data, headers=headers, method=method
    )
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())

results = []

def check(name, passed, detail=""):
    results.append((name, passed, str(detail)))

# ── Detection edge cases ──────────────────────────────────────────
s, r = api("POST", "/stop")
check("Stop when stopped", r["status"] == "not_running", r)

s, r = api("POST", "/pause")
check("Pause when not running", r["status"] == "not_running", r)

s, r = api("POST", "/start")
check("Start", r["status"] == "started", r)

s, r = api("POST", "/start")
check("Start while running", r["status"] == "already_running", r)

time.sleep(1)

s, r = api("POST", "/pause")
check("Pause", r["status"] == "paused", r)

s, r = api("POST", "/pause")
check("Resume", r["status"] == "resumed", r)

s, r = api("POST", "/stop")
check("Stop", r["status"] == "stopped", r)

# ── Spam concurrent start/stop ────────────────────────────────────
def cycle():
    for _ in range(5):
        api("POST", "/start"); time.sleep(0.05)
        api("POST", "/stop");  time.sleep(0.05)

threads = [threading.Thread(target=cycle) for _ in range(3)]
for t in threads: t.start()
for t in threads: t.join()
s, r = api("GET", "/stats")
check("Spam start/stop no crash", s == 200, f"running={r['running']}")
api("POST", "/stop")

# ── Stats: update while running, reset on stop ────────────────────
api("POST", "/start")
time.sleep(3)
s, r = api("GET", "/stats")
check("FPS > 0 while running",      r["fps"] > 0,             r["fps"])
check("Session timer ticking",      r["session_time"] != "",  r["session_time"])
check("running=True while running", r["running"] == True,     r["running"])

api("POST", "/stop")
time.sleep(0.5)
s, r = api("GET", "/stats")
check("FPS resets to 0 after stop",       r["fps"] == 0,        r["fps"])
check("Crack count resets after stop",    r["crack_count"] == 0, r["crack_count"])
check("Session timer clears after stop",  r["session_time"] == "", repr(r["session_time"]))
check("running=False after stop",         r["running"] == False, r["running"])

# ── Settings round-trips ──────────────────────────────────────────
s, r = api("PUT", "/settings", {"confidence": 0.8})
check("Confidence update", r["confidence"] == 0.8, r["confidence"])

s, r = api("PUT", "/settings", {"confidence": 9999})
check("Confidence clamped to 0.95", r["confidence"] == 0.95, r["confidence"])

s, r = api("PUT", "/settings", {"confidence": -1})
check("Confidence clamped to 0.1", r["confidence"] == 0.1, r["confidence"])

s, r = api("PUT", "/settings", {"camera_index": 2})
check("camera_index update", r["camera_index"] == 2, r["camera_index"])

s, r = api("PUT", "/settings", {"camera_url": "http://192.168.1.1:8080/video"})
check("camera_url update", r["camera_url"] == "http://192.168.1.1:8080/video", r["camera_url"])

s, r = api("PUT", "/settings", {"camera_url": ""})
check("camera_url clears", r["camera_url"] == "", r["camera_url"])

s, r = api("PUT", "/settings", {"show_labels": False})
check("show_labels=False", r["show_labels"] == False, r["show_labels"])

s, r = api("PUT", "/settings", {"show_confidence": False})
check("show_confidence=False", r["show_confidence"] == False, r["show_confidence"])

s, r = api("PUT", "/settings", {"show_labels": True, "show_confidence": True})
check("Restore toggles", r["show_labels"] and r["show_confidence"], r)

s, r = api("PUT", "/settings", {"model_name": "bad.pt"})
check("Bad model_name returns 400", s == 400, f"{s} {r}")

s, r = api("GET", "/settings")
check("Settings unchanged after bad model", r["model_name"] == "crack_n.pt", r["model_name"])

# ── Screenshots ───────────────────────────────────────────────────
api("PUT", "/settings", {"camera_index": 0, "camera_url": ""})

s, r = api("POST", "/screenshot")
check("Screenshot before start returns 409", s == 409, f"{s} {r}")

s, r = api("POST", "/start")
assert r.get("status") == "started", f"Camera failed to open: {r}"
time.sleep(2)

s, r = api("POST", "/screenshot")
check("Screenshot while running", r.get("status") == "ok", r)
fname = r.get("filename", "")

api("POST", "/pause")
s, r = api("POST", "/screenshot")
check("Screenshot while paused", r.get("status") == "ok", r)
fname2 = r.get("filename", "")

api("POST", "/stop")

s, r = api("GET", "/screenshots")
check("Gallery lists both screenshots", len(r) == 2, f"count={len(r)}")

s, r = api("DELETE", f"/screenshots/{fname}")
check("Delete screenshot", r.get("status") == "ok", r)

s, r = api("DELETE", f"/screenshots/{fname}")
check("Delete already-deleted returns 404", s == 404, f"{s} {r}")

s, r = api("GET", "/screenshots")
check("Gallery shows 1 after delete", len(r) == 1, f"count={len(r)}")

if fname2:
    api("DELETE", f"/screenshots/{fname2}")

s, r = api("GET", "/screenshots")
check("Gallery empty after cleanup", len(r) == 0, f"count={len(r)}")

# ── Path traversal ────────────────────────────────────────────────
traversal = urllib.parse.quote("../../requirements.txt", safe="")
req2 = urllib.request.Request(
    f"http://127.0.0.1:8000/api/screenshots/{traversal}", method="GET"
)
try:
    with urllib.request.urlopen(req2) as resp:
        body = resp.read()
        check("Path traversal blocked", b"ultralytics" not in body, "served file content!")
except urllib.error.HTTPError as e:
    check("Path traversal blocked", e.code in (400, 403, 404), f"HTTP {e.code}")

# ── Model switch during session ───────────────────────────────────
api("PUT", "/settings", {"camera_index": 0, "camera_url": ""})
api("POST", "/start")
time.sleep(1)
api("PUT", "/settings", {"model_name": "crack_n.pt"})
time.sleep(1)
s2, r2 = api("GET", "/stats")
check("Model switch mid-session no crash", s2 == 200 and r2["running"], r2)
api("POST", "/stop")

# ── Reset settings to defaults ────────────────────────────────────
api("PUT", "/settings", {"confidence": 0.45, "camera_index": 0, "show_labels": True, "show_confidence": True})

# ── Print results ─────────────────────────────────────────────────
print()
passed = sum(1 for _, p, _ in results if p)
failed = sum(1 for _, p, _ in results if not p)
print(f"  Results: {passed} passed, {failed} failed")
print()
for name, p, detail in results:
    status = "PASS" if p else "FAIL"
    suffix = f" — {detail}" if not p else ""
    print(f"  {status}: {name}{suffix}")
