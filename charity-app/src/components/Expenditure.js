import React, {useState, useEffect} from 'react';
import { addExpenditure, getExpenditures, disburseFunds } from '../contractInteraction';

const Expenditure = () => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const[expenditures, setExpenditures] = useState([]);
    const [recipient, setRecipient] = useState('');

    useEffect(() => {
        const fetchExpenditures = async () => {
            const exps = await getExpenditures();
            setExpenditures(exps);
        };
        fetchExpenditures();
    }, []);

    const handleAddExpenditure = async () => {
        await addExpenditure(description, amount);
        const updatedExpenditures = await getExpenditures();
        setExpenditures(updatedExpenditures);
    };

    const handleDisburseFunds = async() => {
        await disburseFunds(amount, recipient);
        const updatedExpenditures = await getExpenditures();
        setExpenditures(updatedExpenditures);
    };

    return (
        <div>
            <h2>Add Expenditure</h2>
            <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
            />
            <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount in ETH"
            />
            <button onClick={handleAddExpenditure}>Add Expenditure</button>

            <h3>Disburse Funds</h3>
            <input
                type ="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Recipient Address"
            />
            <button onClick={handleDisburseFunds}>Disburse Funds</button>

            <h3>Expenditures</h3>
            <ul>
                {expenditures.map((expenditure, index) => (
                    <li key={index}>
                        {expenditure.description} - {expenditure.amount} ETH - {expenditure.recipient}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Expenditure;
