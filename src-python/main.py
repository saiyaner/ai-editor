from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.request
import sys

class AIServer(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        sys.stderr.write("%s - - [%s] %s\n" %
                         (self.address_string(),
                          self.log_date_time_string(),
                          format%args))
        sys.stderr.flush()

    def do_GET(self):
        if self.path == '/models':
            ollama_url = "http://localhost:11434/api/tags"
            try:
                req = urllib.request.Request(ollama_url)
                with urllib.request.urlopen(req) as response:
                    res_body = response.read().decode('utf-8')
                    res_json = json.loads(res_body)
                    models = [model.get('name') for model in res_json.get('models', [])]
            except Exception as e:
                self.log_message("Error fetching models from Ollama: %s", str(e))
                # Fallback models
                models = ["qwen2.5-coder:3b", "deepseek-coder:1.3b"]
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"models": models}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == '/ask_ai':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                prompt = data.get('prompt', '')
                images = data.get('images', [])
                model = data.get('model', 'qwen2.5-coder:3b')
            except Exception as e:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(json.dumps({"error": f"Invalid JSON: {str(e)}"}).encode('utf-8'))
                return

            self.log_message("Received prompt for AI: %s... (images: %d, model: %s)", prompt[:50].replace('\n', ' '), len(images), model)

            # Clean images of metadata prefix (e.g. 'data:image/png;base64,')
            cleaned_images = []
            for img in images:
                if "," in img:
                    cleaned_images.append(img.split(",", 1)[1])
                else:
                    cleaned_images.append(img)

            # Query local Ollama
            ollama_url = "http://localhost:11434/api/generate"
            ollama_payload = {
                "model": model,
                "prompt": prompt,
                "stream": False
            }
            if cleaned_images:
                ollama_payload["images"] = cleaned_images
                
            ollama_data = json.dumps(ollama_payload).encode('utf-8')

            req = urllib.request.Request(
                ollama_url, 
                data=ollama_data, 
                headers={'Content-Type': 'application/json'}
            )

            try:
                with urllib.request.urlopen(req) as response:
                    res_body = response.read().decode('utf-8')
                    res_json = json.loads(res_body)
                    ai_response = res_json.get('response', '')
            except Exception as e:
                self.log_message("Error calling local AI (Ollama): %s", str(e))
                ai_response = f"Error calling local AI (Ollama via Python): {str(e)}"

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"response": ai_response}).encode('utf-8'))

        elif self.path == '/autocomplete':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                prefix = data.get('prefix', '')
                suffix = data.get('suffix', '')
                model = data.get('model', 'qwen2.5-coder:3b')
            except Exception as e:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(json.dumps({"error": f"Invalid JSON: {str(e)}"}).encode('utf-8'))
                return

            self.log_message("Received autocomplete request (model: %s)", model)

            # Build the Fill-in-the-Middle prompt
            prompt = f"<fim_prefix>{prefix}<fim_suffix>{suffix}<fim_middle>"

            # Query local Ollama
            ollama_url = "http://localhost:11434/api/generate"
            ollama_payload = {
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "stop": ["<fim_prefix>", "<fim_suffix>", "<fim_middle>", "<|endoftext|>", "\n\n", "```"]
                }
            }
            ollama_data = json.dumps(ollama_payload).encode('utf-8')

            req = urllib.request.Request(
                ollama_url, 
                data=ollama_data, 
                headers={'Content-Type': 'application/json'}
            )

            try:
                with urllib.request.urlopen(req) as response:
                    res_body = response.read().decode('utf-8')
                    res_json = json.loads(res_body)
                    suggestion = res_json.get('response', '')
            except Exception as e:
                self.log_message("Error calling local AI for autocomplete: %s", str(e))
                suggestion = ""

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"suggestion": suggestion}).encode('utf-8'))
            
        else:
            self.send_response(404)
            self.end_headers()

def run(port=11435):
    server_address = ('127.0.0.1', port)
    httpd = HTTPServer(server_address, AIServer)
    sys.stderr.write(f"Starting Python AI localhost server on http://127.0.0.1:{port}...\n")
    sys.stderr.flush()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        sys.stderr.write("\nPython AI server stopped.\n")

if __name__ == '__main__':
    run()
