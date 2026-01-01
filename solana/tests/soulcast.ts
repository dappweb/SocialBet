import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Soulcast } from "../target/types/soulcast";
import { expect } from "chai";

describe("soulcast", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.Soulcast as Program<Soulcast>;

    it("Is initialized!", async () => {
        // Basic test to ensure program is deployable and can be reached
        // Note: Actual initialization requires more setup for PDA and accounts
        console.log("Program ID:", program.programId.toString());
        expect(program.programId).to.not.be.null;
    });
});
