# download_qwen.py
import os
import urllib.request

model_url = "https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf"
model_path = "backend/data/models/qwen2.5-1.5b-instruct-q4_k_m.gguf"

os.makedirs("backend/data/models", exist_ok=True)

if not os.path.exists(model_path):
    print(f"Downloading Qwen 1.5B model (~1GB)...")
    urllib.request.urlretrieve(model_url, model_path)
    print("Download complete!")
else:
    print("Model already downloaded!")