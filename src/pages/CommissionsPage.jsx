import React from 'react';
import { useNavigate } from 'react-router-dom';
import CommissionList from '../components/monetization/CommissionList';
import HeaderBar from '../components/HeaderBar';

const CommissionsPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            background: '#000',
            color: '#fff',
            paddingBottom: '80px' // Space for bottom nav
        }}>
            <HeaderBar title="Commissions" variant="blur" />

            <div style={{ padding: '1rem' }}>
                <CommissionList />
            </div>
        </div>
    );
};

export default CommissionsPage;
