import ReactXnft, { Text, View, Image, List, ListItem, Button, usePublicKey } from "react-xnft";
import React, { useEffect, useState } from "react";
import * as anchor from "@project-serum/anchor";
import { PublicKey, clusterApiUrl } from '@solana/web3.js';

import { useProgram } from "./hooks/useProgram";

//
// On connection to the host environment, warm the cache.
//
ReactXnft.events.on("connect", () => {
  // no-op
});

const network = clusterApiUrl('testnet');

export function App() {
  const publicKey = usePublicKey();  
  const { program, connection } = useProgram();
  const [ betAmount, setBetAmount ] = useState(0.1);
  const [statusInfo, setStatusInfo] = useState("Idle");

  useEffect(() => {
    setStatusInfo("you set bet amount: " + betAmount);
  }, [betAmount])

  const playFlip = async ( betSide: Number ) => {
    try{
      if (publicKey && program && connection) {
        const amount = betAmount / 1.0 * anchor.web3.LAMPORTS_PER_SOL;

        const [lock_account, _escrow_account_bump] = await PublicKey.findProgramAddress(
          [Buffer.from(anchor.utils.bytes.utf8.encode("base-testaccount"))],
          program.programId
        );
        const [escrow_account, bump] = await PublicKey.findProgramAddress(
          [Buffer.from(anchor.utils.bytes.utf8.encode("vault-testaccount"))],
          program.programId
        );
        setStatusInfo("Processing...");
        const tx = await program.methods
        .bet(betSide, new anchor.BN(amount))
        .accounts({
          lockAccount: lock_account, // publickey for our new account
          owner: publicKey,
          escrowAccount: escrow_account,
          systemProgram: anchor.web3.SystemProgram.programId
        })
        .signers([])
        .transaction();
        console.log('sending transaction')
        // @ts-ignore
        const signature = await window.xnft.send(tx);
        console.log('got signature', signature);
        let getTxReq = {
          jsonrpc: "2.0",
          id: 1,
          method: "getTransaction",
          params: [ signature, "json" ]
        }
        getConfirmedTransaction(getTxReq);
      }
    } catch (error) {
      console.error(error);
      setStatusInfo("Something went wrong, please try again.");
    }
  };

  const getConfirmedTransaction = async (getTxReq) => {
    let res = await fetch(network, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(getTxReq)
    });
    const resData = await res.json();
    if(!!resData.result) {
      if(resData.result.meta.preBalances[0] > resData.result.meta.postBalances[0]) {
        setStatusInfo("You lost :(");
      } else {
        setStatusInfo("You won. you got DOUBLE!");
      }
    } else {
      setTimeout(async () => {
        getConfirmedTransaction(getTxReq);
      }, 1000);
    }
  }

  return (
    <View className="App" style={{backgroundColor: "#3D0107"}}>
      <View style={{backgroundColor: "black", display:"flex", padding: "8px",}}>
      <Image src="https://www.pngall.com/wp-content/uploads/13/Casino-Roulette-Background-PNG.png" style={{width:"15%", height:"40px", paddingLeft:"10px"}}/>
      <Text style={{
      textAlign: "left",
      top: "50%",transform: "translateY(20%)", paddingLeft:"10px"
      }}>SolVegas{publicKey.toString()}</Text>
      </View>
      <View style={{backgroundColor: "black",
      background: "linear-gradient(to bottom, #874C00 40%, #090500",
      textAlign: "center",
      margin: "20px",
      borderRadius: "10px",
      border: "1px solid white"}}>
        <View style={{backgroundColor: "#4381A4",
          marginLeft: "110px",
          marginRight: "110px",
          marginBottom: "20px",
          textAlign: "center",
          borderBottomLeftRadius: "20px",
          borderBottomRightRadius: "20px",
          border: "0px solid white"}}>
          <Text style={{
          padding: "3px",
          textAlign: "center",}}>Coin Flip</Text>
        </View>
        <Image src="https://clipart.world/wp-content/uploads/2021/09/Coin-clipart-transparent-5.png"
        style={{width:"80px",
        height:"80px"}}/>
        <Text
        style={{
        textAlign: "center",
        margin: "10px",}}>DOUBLE. OR. NOTHING.</Text>
      </View>
      <View style={{
        marginLeft:"20px",
        marginTop: "-20px",
        display: "flex",
      }}>
        <Text style={{display:"in-line", whiteSpace:"nowrap", top: "50%",transform: "translateY(30%)"}}>Choose Token</Text>
        {/*<TextField type="text" style={{
        marginLeft: "40px",
        color: "#8E0E05",
        borderRadius:"10px",
        border: "1px solid #FE5656",
        backgroundColor: "#8E0E05",
        }}/>*/}
        <Button style={{marginLeft: "50px", marginTop:"10px", height:"30px", width: "50%",
      backgroundColor: "#8E0E05", border: "1px solid #FE5656"}}>SOL</Button>
      </View>
      <Text style={{marginTop:"10px",textAlign:"center", fontSize:"10px"}}>Min Flip: 0.1 Max Flip:5</Text>
      <View style={{marginLeft:"30px", display:"flex"}}>
        <Button style={{width: "15%", height:"50px", color: "#55481A",
      border: "6px solid #AF8439", backgroundColor:"#FFC93D", marginLeft:"0px", marginRight:"10px",marginTop:"10px"}} onClick={() => setBetAmount(0.1)}>0.1</Button>
      <Button style={{width: "15%", height:"50px",color: "#55481A",
      border: "6px solid #AF8439", backgroundColor:"#FFC93D", margin:"10px"}} onClick={() => setBetAmount(0.25)}>0.25</Button>
      <Button style={{width: "15%", height:"50px",color: "#55481A",
      border: "6px solid #AF8439", backgroundColor:"#FFC93D", margin:"10px"}} onClick={() => setBetAmount(0.5)}>0.5</Button>
      <Button style={{width: "15%", height:"50px",color: "#55481A",
      border: "6px solid #AF8439", backgroundColor:"#FFC93D", margin:"10px"}} onClick={() => setBetAmount(1)}>1</Button>
      </View>
      <View style={{marginLeft:"30px", marginTop:"-10px", display:"flex"}}>
        <Button style={{width: "15%", height:"50px", color: "#55481A",
      border: "6px solid #AF8439", backgroundColor:"#FFC93D", marginLeft:"0px", marginRight:"10px",marginTop:"10px"}} onClick={() => setBetAmount(2)}>2</Button>
      <Button style={{width: "15%", height:"50px",color: "#55481A",
      border: "6px solid #AF8439", backgroundColor:"#FFC93D", margin:"10px"}} onClick={() => setBetAmount(3)}>3</Button>
      <Button style={{width: "15%", height:"50px",color: "#55481A",
      border: "6px solid #AF8439", backgroundColor:"#FFC93D", margin:"10px"}} onClick={() => setBetAmount(4)}>4</Button>
      <Button style={{width: "15%", height:"50px",color: "#55481A",
      border: "6px solid #AF8439", backgroundColor:"#FFC93D", margin:"10px"}} onClick={() => setBetAmount(5)}>5</Button>
      </View>
      <View style={{marginLeft:"20px", display:"flex", justifyContent: "center"}}>
        <Button style={{width: "30%", height:"60px", color: "#55481A",
        border: "6px solid #AF8439", backgroundColor:"#FFC93D", marginLeft:"-10px", marginRight:"20px",marginTop:"10px"}} onClick={() => playFlip(0)}>HEAD</Button>
        <Button style={{width: "30%", height:"60px",color: "#55481A",
        border: "6px solid #AF8439", backgroundColor:"#FFC93D", margin:"10px"}} onClick={() => playFlip(1)}>TAILS</Button>
      </View>
      <View style={{marginLeft:"20px", marginRight:"20px"}}>
        <List style={{ padding:"5px", backgroundColor:"",}}>
          <ListItem style={{color:"white",paddingLeft:"10px"}}>{statusInfo}</ListItem>
        </List>
      </View>
    </View>
  );
}