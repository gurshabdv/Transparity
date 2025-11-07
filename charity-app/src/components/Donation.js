import React, {useState, useEffect} from 'react';
//import Web3 from 'web3';
import { donate, getDonations } from '../contractInteraction';

const Donation = () => {
  const [amount, setAmount] = useState('');
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    const fetchDonations = async () => {
      const donationsList = await getDonations();
      setDonations(donationsList);
    };

    fetchDonations();
  }, []);

  const handleDonate = async () => {
    await donate(amount);
    const updatedDonations = await getDonations();
    setDonations(updatedDonations);
  };

  return (
    <div>
      <h2>Make a Donation</h2>
      <input  
        type="text"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount in Eth"
      />
      <button onClick={handleDonate}>Donate</button>
      <h3>Donations</h3>
      <ul>
        {donations.map((donation, index) => (
          <li key={index}>{donation}</li>
        ))}
      </ul>
    </div>
  );
};

export default Donation;
