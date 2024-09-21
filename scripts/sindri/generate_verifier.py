import os
from sindri import Sindri
sindri = Sindri(os.getenv("SINDRI_API_KEY", ""))
print(os.getenv("SINDRI_API_KEY", ""))
circuit_id = "b8832f1f-dc69-4cc4-9150-7cb6b3947b6d"
smart_contract_code = sindri.get_smart_contract_verifier(circuit_id)
with open("ZKMLVerifier.sol", "w") as f:
    f.write(smart_contract_code)
