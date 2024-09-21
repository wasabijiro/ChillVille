#! /usr/bin/env python
import os
from sindri.sindri import Sindri  # pip install sindri

# Obtain your API Key from an environment variable
API_KEY = os.getenv("SINDRI_API_KEY", "")
print("API Key: ", API_KEY)

# Initialize an instance of the Sindri API SDK
sindri = Sindri(API_KEY)
sindri.set_verbose_level(1)  # Enable verbose stdout

# Create a circuit
circuit_upload_path = "../../circuits/zkml/"
circuit_id = sindri.create_circuit(circuit_upload_path)

# Prove the circuit
# proof_input_file_path = "../../circuits/zkml/input.json"
# with open(proof_input_file_path, "r") as f:
#     proof_id = sindri.prove_circuit(circuit_id, f.read())
