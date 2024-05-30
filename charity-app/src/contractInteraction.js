import { ethers } from 'ethers';
import DonationABI from './contracts/Donation.json';
import ExpenditureABI from './contracts/Expenditure.json';

const { REACT_APP_INFURA_PROJECT_ID, REACT_APP_PRIVATE_KEY, REACT_APP_DONATION_CONTRACT_ADDRESS, REACT_APP_EXPENDITURE_CONTRACT_ADDRESS } = process.env;

const provider = new ethers.providers.InfuraProvider('sepolia', REACT_APP_INFURA_PROJECT_ID);
const signer = new ethers.Wallet(REACT_APP_PRIVATE_KEY, provider);

const donationContract = new ethers.Contract(
  REACT_APP_DONATION_CONTRACT_ADDRESS,
  DonationABI.abi,
  signer
);

const expenditureContract = new ethers.Contract(
  REACT_APP_EXPENDITURE_CONTRACT_ADDRESS,
  ExpenditureABI.abi,
  signer
);

export const donate = async (amount) => {
  const tx = await donationContract.donate({ value: ethers.utils.parseEther(amount) });
  await tx.wait();
  console.log('Donation successful:', tx);
};

export const getDonations = async () => {
  const donations = await donationContract.getDonation();
  return donations;
};

export const addExpenditure = async (description, amount) => {
  const tx = await expenditureContract.addExpenditure(description, ethers.utils.parseEther(amount));
  await tx.wait();
  console.log('Expenditure added:', tx);
};

export const getExpenditures = async () => {
  const expenditures = await expenditureContract.getExpenditures();
  return expenditures;
};

export const disburseFunds = async (amount, recipient) => {
  const tx = await expenditureContract.disburseFunds(ethers.utils.parseEther(amount), recipient);
  await tx.wait();
  console.log('Funds disbursed:', tx);
};
