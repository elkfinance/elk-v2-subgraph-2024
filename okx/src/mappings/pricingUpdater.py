import json
import os

def update_pricing_ts():
    # Get the current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))

    # Find the .json file in the current directory
    json_files = [f for f in os.listdir(current_dir) if f.endswith('.json')]
    if not json_files:
        print("No .json file found in the current directory.")
        return

    json_file = os.path.join(current_dir, json_files[0])
    pricing_ts_file = os.path.join(current_dir, 'pricing.ts')

    # Load the JSON data
    with open(json_file, 'r') as f:
        data = json.load(f)

    # Extract addresses and symbols
    tokens = data.get('tokens', [])
    new_entries = [f"  '{token['address'].lower()}', // {token['symbol']}\n" for token in tokens]

    # Read the pricing.ts content
    with open(pricing_ts_file, 'r') as f:
        lines = f.readlines()

    # Find the WHITELIST section and insert new entries
    whitelist_start = None
    for i, line in enumerate(lines):
        if 'let WHITELIST: string[] = [' in line:
            whitelist_start = i
            break

    if whitelist_start is None:
        print("WHITELIST section not found.")
        return

    # Insert the new addresses before the closing bracket of WHITELIST
    insert_index = whitelist_start + 1
    while not lines[insert_index].strip().endswith(']'):
        insert_index += 1

    # Insert new entries with each on a new line
    lines = lines[:insert_index] + new_entries + lines[insert_index:]

    # Write the updated content back to the pricing.ts file
    with open(pricing_ts_file, 'w') as f:
        f.writelines(lines)

    print("Updated pricing.ts successfully.")

# Run the function
update_pricing_ts()
