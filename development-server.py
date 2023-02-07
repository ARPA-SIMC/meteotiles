#!/usr/bin/python3
import argparse
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler

TILES_SERVER_URL = ""

def create_handler(tiles_server_url):
    class DevelopmentHttpHandler(SimpleHTTPRequestHandler):
        def do_GET(self):
            if self.path.startswith("/tiles"):
                path = self.path[7:]
                self.send_response(302)
                self.send_header('Location', f"{tiles_server_url}/{path}")
                self.end_headers()
            else:
                super().do_GET()

    return DevelopmentHttpHandler


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("tiles_server_url")
    args = parser.parse_args()
    handler = create_handler(args.tiles_server_url)
    server = HTTPServer(("localhost", args.port), handler)
    server.serve_forever()
