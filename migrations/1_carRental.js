var CarRental= artifacts.require("./contracts/CarRental.sol")

module.exports=async function(deployer){
    await deployer.deploy(CarRental);
}