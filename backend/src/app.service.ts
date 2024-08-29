import { Injectable } from '@nestjs/common';
import * as tokenJson from './assets/MyToken.json';
import { createPublicClient, http, Address, formatEther } from 'viem';
import { sepolia } from 'viem/chains';
import { PrivateKeyAccount } from 'viem';


@Injectable()
export class AppService {
  publicClient;

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

  getTransactionReceipt(hash: string) {
    throw new Error('Method not implemented.');
  }

  mintTokens(address: any) {
    throw new Error('Method not implemented.');
  }
  checkMinterRole(address: string) {
    throw new Error('Method not implemented.');
  }
  getServerWalletAddress() {
    throw new Error('Method not implemented.');
  }

  
}

