## 1. Root activation workflow

- [x] 1.1 Add a root-level activation command that a fresh-clone user can run without knowing the internal repo structure.
- [x] 1.2 Implement the activation flow so it checks dependency state, local app startability, and `/dev-loop` reachability.
- [x] 1.3 Ensure the activation flow exits with clear success and failure states that other tooling can consume.

## 2. Browser and MCP readiness reporting

- [x] 2.1 Add readiness checks for Playwright browser availability and any required local browser automation prerequisites.
- [x] 2.2 Add MCP readiness detection that reports whether Codex-native MCP usage appears configured and whether the sidecar path is available.
- [x] 2.3 Format the readiness output so users can distinguish app-ready, playwright-ready, mcp-ready, and fallback-ready states.

## 3. Activation documentation

- [x] 3.1 Update the root README to present a single first-run activation path with explicit success checkpoints.
- [x] 3.2 Update deeper `knowledge/` docs so they support the same activation path instead of duplicating or diverging from it.
- [x] 3.3 Update app-level docs or helper text so first-time users are pointed back to the root activation flow.

## 4. Verification

- [x] 4.1 Run the activation command on a machine state representative of a fresh clone and capture the expected output states.
- [x] 4.2 Re-run the supported validation commands to ensure activation work does not regress the existing demo and test flows.
- [x] 4.3 Refresh any generated repo metadata if the activation commands or documented structure change.
