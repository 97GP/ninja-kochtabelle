from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import logging
from urllib.parse import parse_qs
import os

# Konfiguriere logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RecipeHandler(SimpleHTTPRequestHandler):
    def do_PUT(self):
        """Handle PUT requests to update data.json"""
        if self.path == '/data/data.json':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                
                # Validiere JSON
                data = json.loads(post_data.decode('utf-8'))
                
                # Speichere in data.json
                with open('data/data.json', 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(b'{"status": "success"}')
                logger.info("Daten erfolgreich aktualisiert")
                
            except Exception as e:
                logger.error(f"Fehler beim Speichern der Daten: {str(e)}")
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(b'{"status": "error"}')
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        """Handle GET requests with CORS headers"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        return SimpleHTTPRequestHandler.do_GET(self)

    def do_OPTIONS(self):
        """Handle OPTIONS requests for CORS"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def run_server(port=8000):
    """Startet den Server auf dem angegebenen Port"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, RecipeHandler)
    
    # Hole die lokale IP-Adresse
    import socket
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)
    
    print(f"Server läuft auf:")
    print(f"- Lokal: http://localhost:{port}")
    print(f"- Netzwerk: http://{local_ip}:{port}")
    print("Zum Beenden Strg+C drücken")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer wird beendet...")
        httpd.server_close()

if __name__ == '__main__':
    run_server()
