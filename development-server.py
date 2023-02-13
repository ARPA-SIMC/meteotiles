#!/usr/bin/python3
import argparse
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.request import urlopen


def create_handler(tiles_server_url, do_redirect):
    class DevelopmentHttpHandler(SimpleHTTPRequestHandler):
        def do_GET(self):
            if self.path.startswith("/tiles"):
                path = self.path[7:]
                new_path = f"{tiles_server_url}/{path}"
                if do_redirect:
                    self.send_response(302)
                    self.send_header('Location', new_path)
                    self.end_headers()
                else:
                    with urlopen(new_path) as response:
                        self.send_response(response.status)
                        for key, value in response.getheaders():
                            self.send_header(key, value)

                        self.end_headers()
                        self.wfile.write(response.read())
            else:
                super().do_GET()

    return DevelopmentHttpHandler


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--action",
                        choices=["redirect", "proxy"],
                        default="redirect",
                        help="Redirect (HTTP 302) or act as a proxy for tiles (default: %(default)s)")
    parser.add_argument("tiles_server_url")
    args = parser.parse_args()
    handler = create_handler(args.tiles_server_url, args.action == "redirect")
    server = HTTPServer(("localhost", args.port), handler)
    server.serve_forever()
