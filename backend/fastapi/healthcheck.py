import requests

if __name__ == "__main__":
    try:
        response = requests.get("http://localhost:8001/healthcheck")
        if response.status_code == 200:
            print("Healthcheck passed.")
        else:
            print(f"Healthcheck failed: {response.status_code}")
            exit(1)
    except Exception as e:
        print(f"Healthcheck error: {e}")
        exit(1)
