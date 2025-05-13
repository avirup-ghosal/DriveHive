const CarRental=artifacts.require("CarRental")

contract("CarRental",(accounts)=>{
    let carRentalPlatform;
    const owner=accounts[0];
    const renter1=accounts[1];
})

beforeEach(async()=>{
    carRentalPlatform=await CarRental.new();
});

