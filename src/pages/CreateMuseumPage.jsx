import React from 'react';
import { useNavigate } from 'react-router-dom';
import MuseumCreator from '@/components/monetization/MuseumCreator';
import HeaderBar from '@/components/HeaderBar';

const CreateMuseumPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            background: '#000',
            color: '#fff',
            paddingBottom: '80px'
        }}>
            <HeaderBar title="Create Museum" variant="blur" />

            <div style={{ padding: '1rem' }}>
                <MuseumCreator onClose={() => navigate('/museum')} />
            </div>
        </div>
    );
};

export default CreateMuseumPage;
