ui_install:
	cd frontend && bun i

ui_dev:
	cd frontend && bun run dev

ui_build:
	cd frontend && bun run build

ml_server:
	cd backend/ml && python app.py

create_circuit:
	cd scripts/sindri && python3.10 -m venv .venv && source .venv/bin/activate && python3.10 create_circuits.py

codegen_verifier:
	cd scripts/sindri python3.10 -m venv .venv && source .venv/bin/activate && venv && python3.10 generate_verifier.py
