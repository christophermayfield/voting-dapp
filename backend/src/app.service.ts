import { Injectable } from '@nestjs/common';
import * as tokenJson from './assets/MyToken.json';
import { createPublicClient, http, Address, formatEther, parseEther, createWalletClient } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { MintTokenDto } from './dtos/mintToken.dto';


@Injectable()
export class AppService {
  publicClient;
  account;
  MINTER_ROLE;
  walletClient;

  constructor() {
    const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);
    this.publicClient = createPublicClient({
      chain: sepolia,
      transport: http(process.env.RPC_ENDPOINT_URL),
    });
    this.walletClient = createWalletClient({
      transport: http(process.env.RPC_ENDPOINT_URL),
      chain: sepolia,
      account: account,
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

  async mintTokens(address: any, amount: any) {
    return { return: true };
    // TODO: implement mintTokens
    // TODO: return the hash for displaying it in the frontend
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

  // async mintTokens(body: MintTokenDto) {
  //   const address = body.address;
  //   const amount = body.amount;
  //   try {
  //     const mintTx = await this.walletClient.writeContract({
  //       address: this.getContractAddress(),
  //       abi: tokenJson.abi,
  //       functionName: 'mint',
  //       args: [address, parseEther(amount.toString())],
  //     });

  //     if (await this.waitForTransactionSuccess(mintTx)) {
  //       console.log(`Minted 100 tokens to ${address}`);
  //       return {
  //         result: true,
  //         message: `Minted 100 tokens to ${address}`,
  //         transactionHash: mintTx,
  //       };
  //     } else {
  //       return {
  //         result: false,
  //         message: `Failed to mint tokens to ${address}`,
  //         transactionHash: mintTx,
  //       };
  //     }
  //   } catch (error) {
  //     console.error('Error in mintTokens:', error);
  //     return {
  //       result: false,
  //       message: `Error minting tokens: ${error.message}`,
  //     };
  //   }
  // }



  async waitForTransactionSuccess(txHash: any) {
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    if (!receipt || receipt.status !== 'success') {
      throw new Error(`Transaction failed. Hash: ${txHash}`);
    }

    return receipt;
  }


  async checkMinterRole(address: string): Promise<boolean> {
    const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
    // const MINTER_ROLE =  await this.publicClient.readContract({
    //   address: this.getContractAddress(),
    //   abi: tokenJson.abi,
    //   functionName: 'MINTER_ROLE'
    // });
    const hasRole = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'hasRole',
      args: [MINTER_ROLE, address],
    });
    return hasRole;
  }

  
  getServerWalletAddress(): string {
    return this.walletClient.account.address;
  }

  
}

