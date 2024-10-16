import requests
import json

def check_archive_node(rpc_url, block_number_hex):
    headers = {'Content-Type': 'application/json'}
    payload = {
        "jsonrpc": "2.0",
        "method": "eth_getBlockByNumber",
        "params": [block_number_hex, False],
        "id": 1
    }
    
    response = requests.post(rpc_url, headers=headers, data=json.dumps(payload))
    return response.json()

# Example usage
rpc_url = "https://rpc.bittorrentchain.io"
block_number_hex = "0x1"  # Block 1 in hex

result = check_archive_node(rpc_url, block_number_hex)
print(json.dumps(result, indent=4))
