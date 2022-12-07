//in nodejs we use require()
//in front-end javascript you cant use require
//using import keyword for frontend is the solution
import { ethers } from "./ethers-5.2.esm.min.js";
import { fundMeABI, fundMeAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;
async function connect() {
    //window is not actually necessary I don't believe?
    if (typeof window.ethereum !== "undefined") {
        try {
            await ethereum.request({
                method: "eth_requestAccounts",
            });
        } catch (error) {
            console.log(error);
        }

        connectButton.innerHTML = ethereum.selectedAddress;

        //can either do the formal request method, or just manually pull in some data from the _state field.
        const accounts = ethereum._state.accounts;

        //const accounts = await ethereum.request({ method: "eth_accounts" });

        console.log(accounts);
    } else {
        connectButton.innerHTML = "No Wallet found.";
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const balance = await provider.getBalance(fundMeAddress);

        console.log(ethers.utils.formatEther(balance));
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value;
    console.log(`funding with ${ethAmount}`);

    if (typeof window.ethereum !== "undefined") {
        // provider / connection to the blockchain
        //signer /wallet / someone with some gas
        //contract that we are interacting with
        // ^ ABI & Address
        const provider = new ethers.providers.Web3Provider(ethereum);

        const signer = provider.getSigner();

        const contract = new ethers.Contract(fundMeAddress, fundMeABI, signer);

        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            });

            await listenForTransactionMine(transactionResponse, provider);
            console.log("done");
        } catch (error) {
            console.log(error);
        }

        console.log("funded");
        // const fundAmount = await ethers
        //     .getDefaultProvider()
        //     .getBalance(fundMeAddress);

        // console.log(ethers.utils.formatEther(fundAmount));
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        console.log("withdrawing...");
        const provider = new ethers.providers.Web3Provider(ethereum);

        const signer = provider.getSigner();
        const contract = new ethers.Contract(fundMeAddress, fundMeABI, signer);

        try {
            const transactionResponse = await contract.withdraw();

            await listenForTransactionMine(transactionResponse, provider);

            console.log("done withdrawing");
        } catch (error) {
            console.log(error);
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}`);
    //listen for transaction to finish
    //provider.once kicks off its own async call, so listenForTransactionMine will continue on and finish, which would result in the above console.log("done");
    //to print out before the 'Completed with... etc'
    //so to handle that we return this as a promise

    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            );
            resolve();
        });
    });

    //return new Promise();
}
