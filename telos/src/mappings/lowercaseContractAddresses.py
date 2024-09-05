import os
import re

# Regex to match EVM contract addresses
contract_address_pattern = re.compile(r'0x[a-fA-F0-9]{40}')

# Function to process a file and convert all contract addresses to lowercase
def convert_contract_addresses_to_lowercase(file_path):
    with open(file_path, 'r') as file:
        content = file.read()

    # Replace contract addresses with lowercase versions
    new_content = re.sub(contract_address_pattern, lambda x: x.group(0).lower(), content)

    # If the content was changed, rewrite the file
    if new_content != content:
        with open(file_path, 'w') as file:
            file.write(new_content)
        print(f'Updated contract addresses in: {file_path}')

# Get the current directory
current_directory = os.path.dirname(os.path.abspath(__file__))

# Iterate over all files in the current directory
for filename in os.listdir(current_directory):
    file_path = os.path.join(current_directory, filename)
    
    # Skip directories
    if os.path.isfile(file_path):
        convert_contract_addresses_to_lowercase(file_path)

print("All files have been processed.")
