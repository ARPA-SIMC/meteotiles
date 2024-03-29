#!/usr/bin/python3
import argparse

try:
    # From Python 3.7
    from http.server import ThreadingHTTPServer as HTTPServer
except ModuleNotFoundError:
    from http.server import HTTPServer

from http.server import SimpleHTTPRequestHandler
from urllib.request import Request, urlopen
from urllib.error import HTTPError


def create_handler(tiles_server_url, do_redirect, tiles_cache_ttl):
    class DevelopmentHttpHandler(SimpleHTTPRequestHandler):
        def do_GET(self):
            if self.path.startswith("/tiles"):
                path = self.path[7:]
                new_path = f"{tiles_server_url}/{path}"
                if do_redirect:
                    self.send_response(302)
                    self.send_header("Location", new_path)
                    self.end_headers()
                else:
                    request = Request(new_path)
                    for key, value in self.headers.items():
                        request.add_header(key, value)

                    try:
                        with urlopen(request) as response:
                            self.send_response(response.status)
                            if tiles_cache_ttl is not None:
                                self.send_header("Cache-Control", f"max-age={tiles_cache_ttl}")

                            self.end_headers()
                            self.wfile.write(response.read())
                    except HTTPError as e:
                        self.send_response(e.code, e.reason)
                        for key, value in e.headers.items():
                            self.send_header(key, value)

                        self.end_headers()
            else:
                super().do_GET()

    return DevelopmentHttpHandler


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument(
        "--action",
        choices=["redirect", "proxy"],
        default="redirect",
        help="Redirect (HTTP 302) or act as a proxy for tiles (default: %(default)s)",
    )
    parser.add_argument("--tiles-cache-ttl", type=int, default=None)
    parser.add_argument("tiles_server_url")
    args = parser.parse_args()
    if args.action == "redirect" and args.tiles_cache_ttl is not None:
        print("WARNING: --tiles-cache-ttl has no effect when --action is not set to proxy")

    handler = create_handler(args.tiles_server_url, args.action == "redirect", args.tiles_cache_ttl)
    server = HTTPServer(("localhost", args.port), handler)
    server.serve_forever()
