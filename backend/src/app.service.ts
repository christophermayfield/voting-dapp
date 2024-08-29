import { Injectable } from '@nestjs/common';
import * as tokenJson from './assets/MyToken.json';
import { createPublicClient, http, Address, formatEther, parseEther } from 'viem';
import { sepolia } from 'viem/chains';
import { PrivateKeyAccount } from 'viem';


@Injectable()
export class AppService {
  publicClient;
  account;
  MINTER_ROLE;
  walletClient: any;

  constructor() {
    this.publicClient = createPublicClient({
      chain: sepolia,
      transport: http(process.env.RPC_ENDPOINT_URL),
    });
  }


  getHello(): string {
    return 'Hello World!';
  }

  getContractAddress(): Address {
    return process.env.TOKEN_ADDRESS as Address;
  }

  async getTokenName(): Promise<string> {
    const name = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: "name"
    });
    return name as string;
  }

  async getTotalSupply(): Promise<string> {
    const totalSupplyBN = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: "totalSupply"
    });
    const totalSupply = formatEther(totalSupplyBN as bigint);
    return totalSupply;
  }

  async getTokenBalance(address: string): Promise<string> {
    const balanceBN = await this.publicClient.readContract({
      address: this.getContractAddress() as `0x${string}`,
      abi: tokenJson.abi,
      functionName: 'balanceOf',
      args: [address],
    });
    const balance = formatEther(balanceBN as bigint);
    return balance;
  }

  async getTransactionReceipt(hash: string) {
    const txReceipt = await this.publicClient.getTransactionReceipt({
      hash: hash as `0x${string}`,
    });
    const serializedReceipt = JSON.parse(
      JSON.stringify(txReceipt, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    );
    return serializedReceipt;
  }

  async mintTokens(address: string) {
    try {
      const mintTx = await this.walletClient.writeContract({
        address: this.getContractAddress(),
        abi: tokenJson.abi,
        functionName: 'mint',
        args: [address, parseEther('100')],
      });

      if (await this.waitForTransactionSuccess(mintTx)) {
        console.log(`Minted 100 tokens to ${address}`);
        return {
          success: true,
          message: `Minted 100 tokens to ${address}`,
          transactionHash: mintTx,
        };
      } else {
        return {
          success: false,
          message: `Failed to mint tokens to ${address}`,
          transactionHash: mintTx,
        };
      }
    } catch (error) {
      console.error('Error in mintTokens:', error);
      return {
        success: false,
        message: `Error minting tokens: ${error.message}`,
      };
    }
  }

  async waitForTransactionSuccess(txHash: any) {
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    if (!receipt || receipt.status !== 'success') {
      throw new Error(`Transaction failed. Hash: ${txHash}`);
    }

    return receipt;
  }


  async checkMinterRole(address: string) {
    const hasMinterRole = await this.publicClient.readContract({
      address: this.getContractAddress() as `0x${string}`,
      abi: tokenJson.abi,
      functionName: 'hasRole',
      args: [this.MINTER_ROLE, address],
    });

    return hasMinterRole as boolean;
  }
  
  getServerWalletAddress(): string {
    return this.account.address;
  }

  
}

