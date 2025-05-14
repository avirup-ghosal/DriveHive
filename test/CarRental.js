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

    it("adds a new car",async ()=>{
        await carRentalPlatform.addCar("BMW M3","dummy url",10,50000,{from:owner});
        const car=await await carRentalPlatform.getCar(1);
        assert.equal(car.name,"BMW M3","Incorrect car name");
        assert.equal(car.imgUrl,"dummy url","Incorrect img url");
        assert.eual(car.rentFee,10,"Incorrect rent fee");
        assert.equal(car.saleFee,50000,"Incorrect sale fee");
    })
});
describe("Check out and check in car",()=>{
    it("Check out a car", async()=>{
        await carRentalPlatform.addUser("Adrian","Walker",{from :renter1});
        await carRentalPlatform.addCar("BMW M3","dummy url",10,50000,{from:owner});
        await carRentalPlatform.checkOut(1,{from:renter1});

        const user=await carRentalPlatform.getUser(renter1);
        assert.equal(user.rentedCarId,1,"User could not check out the car");
    });
    it("Checks in a car", async()=>{
         await carRentalPlatform.addUser("Adrian","Walker",{from :renter1});
        await carRentalPlatform.addCar("BMW M3","dummy url",10,50000,{from:owner});
        await carRentalPlatform.checkOut(1,{from:renter1});
        await new Promise((resolve)=>setTimeout(resolve,60000)); //1 minute
        await carRentalPlatform.checkIn({from: user1});

        const user=await carRentalPlatform.getUser(renter1);

        assert.equal(user.rentedCarId,0,"User could not check in the car");
        assert.equal(user.debt,10,"User debt did not get created");
    });
});

describe("Deposit token and make payment",()=>{
    it("deposits token", async()=>{
        await carRentalPlatform.addUser("Adrian", "Walker", {from: renter1});
        await carRentalPlatform.deposit(100, {from: renter1,value:100});
        const user = await carRentalPlatform.getUser(renter1);
        assert.equal(user.balance, 100, "User could not deposit token");
    });

    it("makes payment", async()=>{
        await carRentalPlatform.addUser("Adrian", "Walker", {from: renter1});
        await carRentalPlatform.addCar("BMW M3", "dummy url", 10, 50000, {from: owner});
        await carRentalPlatform.checkOut(1, {from: renter1});
        await new Promise((resolve) => setTimeout(resolve, 60000)); // 1 minute
        await carRentalPlatform.checkIn({from: renter1})

        await carRentalPlatform.deposit({from: user1,value:100});
        await carRentalPlatform.makePayment({from: renter1});

        const user = await carRentalPlatform.getUser(renter1);

        assert.equal(user.debt,0,"Something went wrong while trying to make the paymemt");
    });
});

describe("edit car",()=>{
    it("should edit an existing car's metadata with valid parameters",async()=>{
        await carRentalPlatform.addCar("BMW M3", "dummy url", 10, 50000, {from: owner});

        const newName="Ford Mustang";
        const newImgUrl="new img url";
        const newRentFee=20;
        const newSaleFee=100000;
        await carRentalPlatform.editCarMetadata(1,newName, newImgUrl, newRentFee, newSaleFee,{from:owner});

        const car=await carRentalPlatform.getCar(1);
        assert.equal(car.name,newName,"Problem editing car name");
        assert.equal(car.imgUrl,newImgUrl,"Problem editing img url");
        assert.equal(car.name,newRentFee,"Problem editing rent fee");
        assert.equal(car.name,newSaleFee,"Problem with editing sale fee");
    });

    it("should edit an existing car's status",async()=>{
        await carRentalPlatform.addCar("BMW M3", "dummy url", 10, 50000, {from: owner});
        const newStatus=0;
        await carRentalPlatform.editCarStatus(1,newStatus,{from: owner});
        const car=await carRentalPlatform.getCar(1);
        assert.equal(car.status,newStatus,"Problem with editing car status");
    })
})
});