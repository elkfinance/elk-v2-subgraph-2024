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
        return True  # Indicate that the file was modified
    return False  # Indicate that no changes were made

# Get the current directory
current_directory = os.path.dirname(os.path.abspath(__file__))

# List to keep track of modified files
modified_files = []

# Walk through all subfolders and files
for root, _, files in os.walk(current_directory):
    for filename in files:
        file_path = os.path.join(root, filename)
        
        # Process each file and check if it was modified
        if convert_contract_addresses_to_lowercase(file_path):
            modified_files.append(file_path)

# Display the list of modified files
if modified_files:
    print("The following files were modified:")
    for file in modified_files:
        print(file)
else:
    print("No files were modified.")

print("All files have been processed.")
