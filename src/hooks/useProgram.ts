import { useEffect, useState } from "react";
import { useConnection, usePublicKey } from 'react-xnft';
import { Connection, PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
// import { AnchorProvider} from "@project-serum/anchor";

import idl from "../coin_flip.json";

const programID = new PublicKey(idl.metadata.address);
const preflightCommitment = "processed";
const commitment = "processed";

export const useProgram = () => {
  const [ program, setProgram ] = useState<anchor.Program<anchor.Idl>>();
  const connection = useConnection();
  const publicKey = usePublicKey();

  useEffect(() => {
    updateProgram();
  }, [connection]);

  const updateProgram = () => {
    if (publicKey) {
      // @ts-ignore
      const program = new anchor.Program(idl as any, programID, window.xnft);
      setProgram(program);
    } else {
      setProgram(undefined);
    }
  };

  return {
    program,
    connection,
  };
};
