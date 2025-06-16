# Checks that the endpoint /health returns a 200 OK response with http.client
import http.client
import sys


def check_health():
    conn = http.client.HTTPConnection("localhost", 8000)
    conn.request("GET", "/health/")
    response = conn.getresponse()
    if response.status == 200 and response.read().decode().strip() == "OK":
        print("Health check passed: 200 OK")
        sys.exit(0)
    else:
        print(f"Health check failed: {response.status}")
        sys.exit(1)


if __name__ == "__main__":
    check_health()
