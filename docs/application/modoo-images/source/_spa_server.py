import os, sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
os.chdir(r"c:\claude-class\art-prep\dist")
class H(SimpleHTTPRequestHandler):
    def do_GET(self):
        path = self.translate_path(self.path)
        if not os.path.exists(path) or os.path.isdir(path):
            self.path = "/index.html"
        return super().do_GET()
    def log_message(self, *a, **k): pass
ThreadingHTTPServer(("127.0.0.1", 8766), H).serve_forever()
