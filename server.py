import json
from http.server import BaseHTTPRequestHandler

class MyHeader(BaseHTTPRequestHandler):
    def do_POST(self) :
        responseCode = 200
        response = ""
        var_len = int(self.headers.get('Content-Length'))
        content = self.rfile.read(var_len)
        payload = json.loads(content)

        if payload.get('train'):
            nn.train(payload[trainArray])
            nn.save()
        elif payload.get('predict'):
            try: 
                response = {
                    "type": "test", 
                    "result": nn.predict(str(payload['image']))
                }
            except:
                responseCode = 500
        else:
            responseCode = 400

        self.send_response(responseCode)
        self.send_header("Content-type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        if response: 
            self.wfile.write(json.dumps(response))
        return


