import requests
import json
import time

def test_subgraph_rpc_capability(rpc_url, block_number, contract_address, retries=3):
    headers = {'Content-Type': 'application/json'}
    block_number_hex = hex(block_number)  # Convert the block number to hexadecimal

    # Attempt multiple retries
    for attempt in range(retries):
        # Step 1: Attempt to call the 'symbol' function of the contract at this block
        state_payload = {
            "jsonrpc": "2.0",
            "method": "eth_call",
            "params": [{
                "to": contract_address,
                "data": "0x06fdde03"  # "symbol()" function selector for ERC20 tokens
            }, block_number_hex],
            "id": 1
        }

        state_response = requests.post(rpc_url, headers=headers, data=json.dumps(state_payload))
        state_data = state_response.json()

        # Check if the 'symbol' contract call was successful
        if 'error' not in state_data:
            print(f"Successfully fetched contract state (symbol) for block {block_number} (hex: {block_number_hex}).")
            print("Contract symbol data:", state_data['result'])
            return True

        # Print the error and retry after a short delay
        print(f"Attempt {attempt + 1} failed: {state_data['error']['message']}")
        time.sleep(2)  # Delay before the next attempt

    # If all retries failed, the node may not be suitable for syncing this subgraph
    print(f"Failed to fetch contract state after {retries} attempts. The node may not be suitable for syncing.")
    return False

# Example usage
rpc_url = "https://mainnet-rpc.brisescan.com"  # Replace with your RPC URL
block_number = 2967675  # The block number where the first pair was created
contract_address = "0xeEeEEb57642040bE42185f49C52F7E9B38f8eeeE"  # Replace with a token contract address in the 1st pair

if test_subgraph_rpc_capability(rpc_url, block_number, contract_address):
    print("The RPC is suitable for setting up a subgraph.")
else:
    print("The RPC is not suitable for setting up a subgraph.")
