ui_install:
	cd frontend && bun i

ui_dev:
	cd frontend && bun run dev

maci_install:
	cd maci-template && yarn install

maci_dev:
	cd maci-template && yarn start

maci_build:
	cd maci-template && yarn next:build

maci_fmt:
	cd maci-template && yarn format

download_zkey:
	cd maci-template && yarn download-zkeys

deploy_maci:
	cd maci-template && yarn deploy

ml_server:
	cd backend/ml && python app.py

create_circuit:
	cd scripts/sindri && python3.10 -m venv .venv && source .venv/bin/activate && python3.10 create_circuits.py

codegen_verifier:
	cd scripts/sindri python3.10 -m venv .venv && source .venv/bin/activate && venv && python3.10 generate_verifier.py
