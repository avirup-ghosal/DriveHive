const CarRental=artifacts.require("CarRental")

contract("CarRental",(accounts)=>{
    let carRentalPlatform;
    const owner=accounts[0];
    const renter1=accounts[1];


beforeEach(async()=>{
    carRentalPlatform=await CarRental.new();
});
describe("Add user and car",()=>{
    it("adds a new user", async()=>{
        await carRentalPlatform.addUser("Adrian","Walker",{from :renter1});
        const user=await carRentalPlatform.getUser(renter1);
        assert.equal(user.name,"Adrian","Incorrect user name");
        assert.equal(user.lastname,"Walker","Incorrect last name");
    });
});
});