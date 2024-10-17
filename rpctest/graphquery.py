import requests

def query_subgraph(api_url, query):
    headers = {
        'Content-Type': 'application/json',
    }

    # The request payload containing the GraphQL query
    payload = {
        'query': query
    }

    # Send the POST request to the subgraph API
    response = requests.post(api_url, json=payload, headers=headers)

    # Check if the request was successful
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Query failed with status code {response.status_code}: {response.text}")

# Example usage
api_url = "https://gateway-arbitrum.network.thegraph.com/api/67092eeba991b3e62aa878a9059e7cbb/subgraphs/id/Hg8oAjoC6kLiFsuZXZX6QYvghnRNq7Y3C8AZaK95g8bF"

# An example GraphQL query to fetch the latest block number (adjust as needed for your specific subgraph)
query = """
{
  _meta {
    block {
      number
      hash
      timestamp
    }
  }
}
# {
#   elkFactories(first: 5) {
#     id
#     pairCount
#     totalVolumeUSD
#     totalVolumeETH
#   }
#   tokens(first: 100) {
#     id
#     symbol
#     name
#     decimals
#   }
# }
"""

try:
    result = query_subgraph(api_url, query)
    print("Query result:", result)
except Exception as e:
    print("Error querying subgraph:", e)
