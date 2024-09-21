ui_install:
	cd frontend && bun i

ui_dev:
	cd frontend && bun run dev

ui_build:
	cd frontend && bun run build

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

maci_merge_signups:
	node ../maci/packages/cli/build/ts/index.js mergeSignups --poll-id 0

maci_merge_messages:
	node build/ts/index.js mergeMessages --poll-id 0

maci_generate_proof:
	node ../maci/packages/cli/build/ts/index.js genProofs \
		--privkey ${privatekey} \
		--poll-id 0 \
		--process-zkey ./zkeys/ProcessMessages_10-2-1-2_test/ProcessMessages_10-2-1-2_test.0.zkey \
		--tally-zkey ./zkeys/TallyVotes_10-1-2_test/TallyVotes_10-1-2_test.0.zkey \
		--tally-file tally.json \
		--output proofs/ \
		--process-wasm ./zkeys/ProcessMessages_10-2-1-2_test/ProcessMessages_10-2-1-2_test_js/ProcessMessages_10-2-1-2_test.wasm \
		--tally-wasm ./zkeys/TallyVotes_10-1-2_test/TallyVotes_10-1-2_test_js/TallyVotes_10-1-2_test.wasm \
		-w true

create_circuit:
	cd scripts/sindri && python3.10 -m venv .venv && source .venv/bin/activate && python3.10 create_circuits.py

codegen_verifier:
	cd scripts/sindri python3.10 -m venv .venv && source .venv/bin/activate && venv && python3.10 generate_verifier.py
