import { ethers, Signer } from "ethers";
import { merklePayoutStrategyFactoryContract } from "../contracts";

/**
 * Deploys a QFVotingStrategy contract by invoking the
 * create on QuadraticFundingVotingStrategyFactory contract
 *
 * @param signerOrProvider
 * @returns
 */
export const deployMerklePayoutStrategyContract = async (
  signerOrProvider: Signer
): Promise<{ payoutContractAddress: string }> => {
  try {
    const chainId = await signerOrProvider.getChainId();

    const _merklePayoutStrategyFactoryContract =
      merklePayoutStrategyFactoryContract(chainId);

    const payoutStrategyFactory = new ethers.Contract(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      _merklePayoutStrategyFactoryContract.address!,
      _merklePayoutStrategyFactoryContract.abi,
      signerOrProvider
    );

    // Deploy a new MerklePayoutStrategy contract
    const tx = await payoutStrategyFactory.create();

    const receipt = await tx.wait();

    let payoutContractAddress;

    if (receipt.events) {
      const event = receipt.events.find(
        (e: { event: string }) => e.event === "PayoutContractCreated"
      );
      if (event && event.args) {
        payoutContractAddress = event.args.payoutContractAddress;
      }
    } else {
      throw new Error("No PayoutContractCreated event");
    }

    console.log("✅ Merkle Payout Transaction hash: ", tx.hash);
    console.log("✅ Merkle Payout Strategy address: ", payoutContractAddress);

    return { payoutContractAddress };
  } catch (error) {
    console.error("deployMerklePayoutStrategyContract", error);
    throw new Error("Unable to deploy merkle payout strategy contract");
  }
};
