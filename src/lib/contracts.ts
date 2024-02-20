
import { ethers } from "ethers";
import type { EIP6963ProviderDetail} from "../types/eip6963";
import {ABIS, WRAPPERS, DOGES } from "../constants/contracts";


export async function fetchDogeBalance(
    provider: EIP6963ProviderDetail,
    wrapped: boolean = false
): Promise<string> {

    if (!provider.chain || !provider.provider) return '';

    const parsedAbi = wrapped ? JSON.parse(ABIS['ERC20Wrapper']) : JSON.parse(ABIS['ERC20']);
    const browserProvider = new ethers.BrowserProvider(provider.provider)
    const dogeAddress = wrapped ? WRAPPERS[provider.chain] : DOGES[provider.chain];
    const tokenContract = new ethers.Contract(dogeAddress, parsedAbi, browserProvider);
    const balance = await tokenContract.balanceOf(provider.account)
    return ethers.formatUnits(balance, 18);
}

export async function checkAllowance(tokenContract: ethers.Contract, owner: string, spender: string): Promise<bigint> {
    return await tokenContract.allowance(owner, spender);
}

export async function approve(tokenContract: ethers.Contract, spender: string, amount: string) {
    const approveTx = await tokenContract.approve(spender, amount);
    await approveTx.wait();
}

export async function wrapDoge(provider: EIP6963ProviderDetail, amount: string, wrap: boolean = true): Promise<boolean> {

    if (!provider.chain || !provider.account || !provider.provider) return false;

    const browserProvider = new ethers.BrowserProvider(provider.provider);
    const signer = await browserProvider.getSigner();

    const tokenAddress = DOGES[provider.chain];
    const tokenContract = new ethers.Contract(tokenAddress, ABIS['ERC20'], signer);
    const wrapperAddress = WRAPPERS[provider.chain];

    const allowance = await checkAllowance(tokenContract, provider.account, wrapperAddress);
    const parsedAmount = ethers.parseUnits(amount, 18);

    if (allowance < parsedAmount) {
        await approve(tokenContract, wrapperAddress, parsedAmount.toString());
    }

    const wrapperContract = new ethers.Contract(wrapperAddress, ABIS['ERC20Wrapper'], signer);

    let txResponse;
    if (wrap) {
        txResponse = await wrapperContract.wrap(parsedAmount);
    } else {
        txResponse = await wrapperContract.unwrap(parsedAmount);
    }
    const receipt = await txResponse.wait();

    return receipt.status === 1 || receipt.status === true;
}