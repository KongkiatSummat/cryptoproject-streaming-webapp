export const WATCH_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_WATCH_TOKEN_ADDRESS
export const STREAMING_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_STREAMING_CONTRACT_ADDRESS

export const WATCH_TOKEN_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
  },
]

export const STREAMING_ABI = [
  {
    name: 'subscribe',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'buyMovie',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'movieId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'rentMovie',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'movieId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'isSubscribed',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'hasAccess',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }, { name: 'movieId', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'subscriptionExpiry',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'movieOwned',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }, { name: 'movieId', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'rentExpiry',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }, { name: 'movieId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'subscriptionPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'buyPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'rentPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
]