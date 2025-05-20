import Web3 from "web3";
import ContractABI from "./ABI/CarRental.json";

let selectedAccount;
let Contract;
let isInitialized=false;
let ContractAddress="0x06fD439AC9fd4545aC0f9f72Cd2871349b8Ad41c";

export const init= async()=>{
    let provider=window.ethereum;
    if(typeof provider !== "undefined"){
        provider.request({method:"eth_requestAccounts"})
        .then((accounts)=>{
            selectedAccount=account[0];
            console.log("Selected account: ", selectedAccount);
        }).catch((err)=>{
            console.error("Error requesting accounts: ", err);
            return;
        })
    }

    window.ethereum.on("accountsChanged", (accounts)=>{
        selectedAccount=accounts[0];
        console.log("Selected account changed: ", selectedAccount);
    });

    const web3=new Web3(provider);

    const networkId=await web3.eth.net.getId();
    
    Contract=new web3.eth.Contract(ContractABI.abi, ContractAddress);
    isInitialized=true;
};

export const getUserAddress=async ()=>{
    if(!isInitialized){
        console.error("Web3Client is not initialized");
        await init();
        return;
    }
    return selectedAccount;
}

export const setOwner=async(newOwner)=>{
    if(!isInitiazed){
        await init();
    }
    try{
        let res=await Contract.methods.setOwner(newOwner).send({from:selectedAccount});
        return res;
    }catch(e){
        console.error("Error setting owner: ", e);
    }
};

export const register=async (name,surname)=>{
    if(!isInitialized){
        await init();
    }
    try{
        let res=await Contract.methods.addUser(name,surname).send({from:selectedAccount});
        return res;
    }catch(e){
        console.error("Error registering user: ", e);
    }
};

export const addCar=async (name,url,rentFee,saleFee)=>{
    if(!isInitialized){
        await init();
    }
    try{
        let res=await Contract.methods.addCar(name,url,rentFee,saleFee).send({from:selectedAccount});
        return res;
    }catch(e){
        console.error("Error adding car: ", e);
    }
}

export const editCarMetadata=async(id,name,imgUrl,rentFee,saleFee)=>{
    if(!isInitialized){
        await init();
    }
    try{
        let res=await Contract.methods.editCarMetadata(id,name,imgUrl,rentFee,saleFee).send({from:selectedAccount});
        return res;
    }catch(e){
        console.error("Error editing car metadata: ", e);
    }
}
export const editCarStatus=async(id,status)=>{
    if(!isInitialized){
        await init();
    }
    try{
        let res=await Contract.methods.editCarStatus(id,status).send({from:selectedAccount});
        return res;
    }catch(e){
        console.error("Error editing car status: ", e);
    }

}

export const checkOut=async (id)=>{
    if(!isInitialized){
        await init();
    }
    try{
        let res=await renterContract.methods.checkOut(id).send({from:selectedAccount}); 
        return res;
    }catch(e){
        console.error("Error checking out car: ", e);   
    }
};

export const checkIn=async ()=>{
    if(!isInitialized){
        await init();
    }
    try{
        let res=await renterContract.methods.checkIn().send({from:selectedAccount}); 
        return res;
    }catch(e){
        console.error("Error checking in car: ", e);   
    }
}
