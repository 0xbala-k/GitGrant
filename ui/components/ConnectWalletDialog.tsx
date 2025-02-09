"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type Network = {
  chainId: string
  name: string
  currency: string
  rpcUrl: string
  blockExplorer: string
}

const SUPPORTED_NETWORKS: Record<string, Network> = {
  ethereum: {
    chainId: "0x1",
    name: "Ethereum Mainnet",
    currency: "ETH",
    rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/your-api-key",
    blockExplorer: "https://etherscan.io",
  },
  polygon: {
    chainId: "0x89",
    name: "Polygon Mainnet",
    currency: "MATIC",
    rpcUrl: "https://polygon-mainnet.g.alchemy.com/v2/your-api-key",
    blockExplorer: "https://polygonscan.com",
  },
}

interface ConnectWalletDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

interface WalletConnectionResponse {
  success: boolean
  message: string
  data?: {
    walletAddress: string
    network: string
  }
}

export function ConnectWalletDialog({
  open,
  onOpenChange,
  userId,
}: ConnectWalletDialogProps) {
  const { toast } = useToast()
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState<string>("ethereum")

  const switchNetwork = async (networkName: string): Promise<void> => {
    if (!window.ethereum) throw new Error("No crypto wallet found")
    
    const network = SUPPORTED_NETWORKS[networkName]
    
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: network.chainId }],
      })
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if ((switchError as { code: number }).code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: network.chainId,
                chainName: network.name,
                rpcUrls: [network.rpcUrl],
                nativeCurrency: {
                  name: network.currency,
                  symbol: network.currency,
                  decimals: 18,
                },
                blockExplorerUrls: [network.blockExplorer],
              },
            ],
          })
        } catch (error) {
          throw new Error(`Failed to add network: ${error instanceof Error ? error.message : String(error)}`)
        }
      }
      throw switchError
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask to connect your wallet")
      }

      // Switch to selected network first
      await switchNetwork(selectedNetwork)

      // Request account access
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[]

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found")
      }

      const walletAddress = accounts[0]

      // Make API call to your backend
      const response = await fetch("/api/connect-wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress,
          userId,
          network: selectedNetwork,
        }),
      })

      const data = (await response.json()) as WalletConnectionResponse

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to connect wallet")
      }

      toast({
        title: "Wallet Connected Successfully",
        description: `Connected to ${
          SUPPORTED_NETWORKS[selectedNetwork].name
        } with wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        variant: "default",
      })

      onOpenChange(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Web3 Wallet</DialogTitle>
          <DialogDescription>
            Connect your Web3 wallet to receive rewards for your contributions.
            Select your preferred network below.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col space-y-3">
            {Object.entries(SUPPORTED_NETWORKS).map(([key, network]) => (
              <Button
                key={key}
                variant="outline"
                className={cn(
                  "justify-start gap-2",
                  selectedNetwork === key && "border-primary"
                )}
                onClick={() => setSelectedNetwork(key)}
              >
                <img
                  src={`/networks/${key}.svg`}
                  alt={network.name}
                  className="h-5 w-5"
                />
                {network.name}
              </Button>
            ))}
          </div>

          <div className="rounded-lg border border-muted bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">
              Make sure you have MetaMask installed and are connected to the
              correct network. Your wallet will be used to receive rewards for your
              contributions.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isConnecting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="min-w-[120px]"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect Wallet"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}