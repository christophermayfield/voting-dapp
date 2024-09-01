import { useState } from "react";
import { hexToString } from "viem";
import { useReadContract } from "wagmi";

export const ViewVotes = () => {
  const [ballotAddress, setballotAddress] = useState("");

  const { data, isError, isLoading } = useReadContract({
    address: ballotAddress,
    abi: [
      {
        inputs: [],
        name: "winnerName",
        outputs: [
          {
            internalType: "bytes32",
            name: "winnerName_",
            type: "bytes32"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
    ],
    functionName: "winnerName",
  });

  const name = typeof data === "string" ? data : `0x`;

  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Reading Votes</h2>
        <div className="form-control w-full max-w-xs my-4">
          <label className="label">
            <span className="label-text">Enter the address for the ballot:</span>
          </label>
          <input
            type="text"
            placeholder="0x...."
            className="input input-bordered w-full max-w-xs"
            value={ballotAddress}
            onChange={e => setballotAddress(e.target.value)}
          />
        </div>
        <div>Winner: {hexToString(name, { size: 32 })}</div>
      </div>
    </div>
  );
}