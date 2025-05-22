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
    if(!isInitialized){
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
        let res=await Contract.methods.checkOut(id).send({from:selectedAccount}); 
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
        let res=await Contract.methods.checkIn().send({from:selectedAccount}); 
        return res;
    }catch(e){
        console.error("Error checking in car: ", e);   
    }
}

export const deposit=async (send_value)=>{
    if(!isInitialized){
        await init();
    }
    try{
        let res=await Contract.methods.deposit().send({from:selectedAccount, value: send_value}); 
        return res;
    }catch(e){
        console.error("Error depositing: ", e);
    }
}
export const makePayment=async()=>{
    if(!isInitialized){
        await init();
    }
    try{
        let res=await Contract.methods.makePayment().send({from:selectedAccount}); 
        return res;
    }catch(e){
        console.error("Error making payment: ", e);
    }
}

export const withdrawBalance=async(value)=>{
    if(!isInitialized){
        await init();
    }
    let send_value=Web3.utils.toWei(value, "ether");
    try{
        let res=await Contract.methods.withdrawBalance(send_value).send({from:selectedAccount}); 
        return res;
    }catch(e){
        console.error("Error withdrawing balance: ", e);
    }
}
export const withdrawOwnerBalance=async(value)=>{
    if(!isInitialized){
        await init();
    }
    let send_value=Web3.utils.toWei(value, "ether");
    try{
        let res=await Contract.methods.withdrawOwnerBalance(send_value).send({from:selectedAccount}); 
        return res;
    }catch(e){
        console.error("Error withdrawing owner balance: ", e);
    }
}

export const getOwner=async()=>{
    if(!isInitialized){
        await init();
    }
    try{
        let res=await Contract.methods.getOwner().call();
        return res.toString();
    }catch(e){
        console.error("Error getting owner: ", e);
    }   
}

export const login=async()=>{
    if(!isInitialized){
        await init();
    }
    try{
        let res=await Contract.methods.getUser(selectedAccount).call();
        return res;
    }catch(e){
        console.error("Error logging in: ", e);
    }
}

export const getCar=async(id)=>{
    if(!isInitialized){
        await init();
    }
    try{
        let res=await Contract.methods.getCar(id).call();
        return res;
    }catch(e){
        console.error("Error getting car: ", e);
    }
}

export const getCarByStatus=async(status)=>{
    if(!isInitialized){
        await init();
    }
    try{
        let res=await Contract.methods.getCarByStatus(status).call();
        return res;
    }catch(e){
        console.error("Error getting car by status: ", e);
    }
}

export const getCurrentCount=async()=>{
    if(!isInitialized){
        await init();
    }
    try{
        let res=await Contract.methods.getCurrentCount().call();
        return res;
    }catch(e){
        console.error("Error getting current count: ", e);
    }
};

export const getContractBalance=async()=>{
    if(!isInitialized){
        await init();
    }
    try{
        let res=await Contract.methods.getContractBalance().call({from:selectedAccount});
        return res;
    }catch(e){
        console.error("Error getting contract balance: ", e);
    }
}

export const getTotalPayments=async()=>{    
    if(!isInitialized){
        await init();
    }
    try{
        let res=await Contract.methods.getTotalPayments().call({from:selectedAccount});
        return res;
    }catch(e){
        console.error("Error getting total payments: ", e);
    }
}
