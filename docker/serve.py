"""Static file server with SPA fallback.

Serve la build statica della webapp; le route client-side (es. /workspaces/...)
che non corrispondono a file reali vengono risolte su index.html.
"""
import http.server
import os

SITE_DIR = '/site'
PORT = 3000


class SPARequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=SITE_DIR, **kwargs)

    def send_head(self):
        path = self.translate_path(self.path)
        if not os.path.exists(path):
            self.path = '/index.html'
        return super().send_head()


if __name__ == '__main__':
    server = http.server.ThreadingHTTPServer(('0.0.0.0', PORT), SPARequestHandler)
    print(f'Serving {SITE_DIR} on port {PORT} (SPA fallback to index.html)')
    server.serve_forever()
