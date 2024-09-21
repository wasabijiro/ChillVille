ui_install:
	cd frontend && yarn install

ui_dev:
	cd frontend && yarn start

ui_build:
	cd frontend && yarn next:build

ui_fmt:
	cd frontend && yarn format

download_zkey:
	cd frontend && yarn download-zkeys

deploy_maci:
	cd frontend && yarn deploy

ml_server:
	cd backend/ml && python app.py

create_circuit:
	cd scripts/sindri && python3.10 -m venv .venv && source .venv/bin/activate && python3.10 create_circuits.py

codegen_verifier:
	cd scripts/sindri python3.10 -m venv .venv && source .venv/bin/activate && venv && python3.10 generate_verifier.py
