// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CarRental is ReentrancyGuard{
  //DATA

  //Counter
  using Counters for Counters.Counter;
  Counters.Counter private _counter;

  //Owner
  address private owner;

  //totalPayments
  uint private totalPayments;

  //user struct
  struct User{
    address walletAddress;
    string name;
    string lastname;
    uint rentedCarId;
    uint balance;
    uint debt;
    uint start;
  }

  //car struct
  struct Car{
    uint id;
    string name;
    string imgUrl;
    Status status;
    uint rentFee;
    uint saleFee;
  }

  //enum to indicate status of car

  enum Status{
    Retired,
    InUse,
    Available
  }

  //events
  event CarAdded(uint indexed id,string name,string imgUrl,uint rentfee,uint saleFee);
  event CarMetadataEdited(uint indexed id,string name, string imgUrl,uint rentFee,uint saleFee);
  event CarStatusEdited(uint indexed id,Status status);
  event UserAdded(address indexed walletAddress,string name,string lastname);
  event Deposit(address indexed walletAddress,uint amount);
  event CheckOut(address indexed walletAddress,uint indexed carid);
  event CheckIn(address indexed walletAddress,uint indexed carId);
  event PaymentMade(address indexed walletAddress,uint amount);
  event Balancewithdraw(address indexed walletAddress,uint amount);
  
  //user mapping
  mapping(address=>User) private users;


  //car mapping
  mapping(uint=>Car) private cars;

  //constructor
  constructor(){
    owner=msg.sender;
    totalPayments=0;
  }

  //MODIFIERs
  //onlyOwner
  modifier onlyOwner(){
    require(msg.sender==owner,"Only the owner can call this function");
    _;
  }

  //FUNCTIONS
  //Execute Functions
  
  //setOwner #onlyOwner
  function setOwner(address _newOwner) external onlyOwner(){
    owner =_newOwner;
  }  

  //addUser  #nonExisting
  function addUser(string calldata name,string calldata lastname) external {
    require(!isUser(msg.sender),"User already exists");
    users[msg.sender]=User(msg.sender,name,lastname,0,0,0,0);

    emit UserAdded(msg.sender, users[msg.sender].name, users[msg.sender].lastname);
  }

  //addCar #onlyOwner #nonExistingCar
  function addCar(string calldata name,string calldata url,uint rent,uint sale) external onlyOwner{
    _counter.increment();
    uint counter=_counter.current();
    cars[counter]=Car(counter,name,url,Status.Available,rent,sale);

    emit CarAdded(counter, cars[counter].name, cars[counter].imgUrl, cars[counter].rentFee, cars[counter].saleFee);
  }

  //editCarMetadata #onlyOwner #existingCar
  function editCarMetadata(uint id,string calldata name,string calldata imgUrl,uint rentFee,uint saleFee) external onlyOwner{
    require(cars[id].id!=0,"Car with given Id does not exist");
    Car storage car=cars[id];
    if(bytes(name).length!=0){
      car.name=name;
    }
    if(bytes(imgUrl).length!=0){
      car.imgUrl=imgUrl;
    }
    if(rentFee>0){
      car.rentFee=rentFee;
    }
    if(saleFee>0){
      car.saleFee=saleFee;
    }
    emit CarMetadataEdited(id, car.name, car.imgUrl, car.rentFee, car.saleFee);
  }

  //editCarStatus #onlyOwner #existingCar
  function editCarStatus(uint id,Status status) external onlyOwner{
    require(cars[id].id!=0,"Car with given id does not exist");
    cars[id].status=status;

    emit CarStatusEdited(id, status);
  }

  //checkOut #existingUser #isCarAvailable
  function checkOut(uint id) external{
    require(isUser(msg.sender),"User does not exist!");
    require(cars[id].status==Status.Available,"Car is not Available for use");
    require(users[msg.sender].rentedCarId==0,"User has already rented a car");
    require(users[msg.sender].debt==0,"User has an outstanding debt!");

    users[msg.sender].start=block.timestamp;
    users[msg.sender].rentedCarId=id;
    cars[id].status=Status.InUse;

    emit CheckOut(msg.sender,id);
  }

  //checkIn #existingUser #userHasRentedACar
  function checkIn() external{
    require(isUser(msg.sender),"User does not exist!");
    uint rentedCarId = users[msg.sender].rentedCarId;
    require(rentedCarId!=0,"User has not rented a car");

    uint usedSeconds=block.timestamp-users[msg.sender].start;
    uint rentFee=cars[rentedCarId].rentFee;
    users[msg.sender].debt+=calculateDebt(usedSeconds,rentFee);

    users[msg.sender].rentedCarId=0;
    users[msg.sender].start=0;
    cars[rentedCarId].status=Status.Available;
    emit CheckIn(msg.sender, rentedCarId);

  }

  //deposit #existingUser
  function deposit() external payable{
    require(isUser(msg.sender),"User does not exist");
    users[msg.sender].balance+=msg.value;

    emit Deposit(msg.sender, msg.value);
  }

  //makePayment #existingUser #existingDebt #sufficient Balance
function makePayment() external{
  require(isUser(msg.sender),"User does not exist");
  uint debt=users[msg.sender].debt;
  uint balance=users[msg.sender].balance;

  require(debt>0,"User has no debt to pay");
  require(balance>= debt,"User has insufficient balance");

  unchecked {
    users[msg.sender].balance-=debt;
  }
  totalPayments+=debt;
  users[msg.sender].debt=0;

  emit PaymentMade(msg.sender, debt);
}

  //withdrawalBalance #existingUser
  function withdrawBalance(uint amount) external nonReentrant{
    require(isUser(msg.sender),"User does not exist");
    uint balance=users[msg.sender].balance;
    require(balance>=amount,"Insufficient balance to withdraw");
     
    unchecked {
      users[msg.sender].balance-=amount;
    }
    (bool success,)=msg.sender.call{value:amount}("");
    require(success,"Transfer failed");

    emit Balancewithdraw(msg.sender,amount);
  }

  //withfrawOwnerBalance #onlyOwner
  function withdrawOwnerBalance(uint amount) external onlyOwner nonReentrant{
    require(totalPayments>=amount,"Insufficient contract balance to withdraw");

    (bool success,)=owner.call{value: amount}("");
    require(success,"Transfer failed");

    unchecked {
      totalPayments-=amount;
    }
  }

  //Query Functions

  //getOwner
  function getOwner() external view returns(address){
    return owner;
  }

  //isUser
  function isUser(address walletAddress) private view returns(bool){
    return users[walletAddress].walletAddress!=address(0);
  }

  //getUser #getexistinguser
  function getUser(address walletAddress) external view returns(User memory){
    require(isUser(walletAddress),"User does not exist");
    return users[walletAddress];
  }  

  //getCar #existingCar
  function getCar(uint id) external view returns(Car memory){
    require(cars[id].id!=0,"Car does not exist");
    return cars[id];
  }

  //getCarbyStatus
function getCarsByStatus(Status _status) external view returns(Car[] memory){
uint count=0;
uint length=_counter.current();
for(uint i=1;i<=length;i++){
  if(cars[i].status==_status){
    count++;
  }
}
Car[] memory carsWithStatus=new Car[] (count);
count=0;
for(uint i=1;i<=length;i++){
  if(cars[i].status==_status){
    carsWithStatus[count]=cars[i];
    count++;
  }
}  
return carsWithStatus;
}
  //calculateDebt
function calculateDebt(uint usedSeconds,uint rentFee) private pure returns(uint){
  uint usedMinutes=usedSeconds/60;
  return usedMinutes*rentFee;
}
  //getCurrentCount
  function getCurrentCount() external view returns(uint){
    return _counter.current();
  }

  //getContractBalance
  function getContractBalance() external view onlyOwner returns(uint){
    return address(this).balance;
  }

  //getContractBalance #onlyOwner

  
  //getTotalPayment #onlyOwner
  function getTotalPayment() external view onlyOwner returns(uint){
    return totalPayments;
  }

}
