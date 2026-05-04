# test_model.py
print("Testing FLAN-T5 model download...")
print("This may take 2-5 minutes for first download (~300MB)\n")

from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

model_name = "google/flan-t5-small"

print(f"Downloading {model_name}...")
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
print("Model downloaded successfully!\n")

# Test the model
prompt = "Answer this academic question: What is data structures?"
inputs = tokenizer(prompt, return_tensors="pt")
outputs = model.generate(inputs.input_ids, max_length=100)
response = tokenizer.decode(outputs[0], skip_special_tokens=True)

print(f"Question: What is data structures?")
print(f"Answer: {response}")
print("\nModel is working!")