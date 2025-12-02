import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShopService } from '../services/ShopService';

/**
 * ShopSetupGate - Wrapper component that enforces shop setup requirement
 * 
 * Usage:
 * <ShopSetupGate>
 *   <PublishButton />
 * </ShopSetupGate>
 * 
 * If shop setup is incomplete and user cannot bypass, redirects to /shop/setup
 * Otherwise, renders children
 */
const ShopSetupGate = ({ children, fallback = null }) => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);
    const [canAccess, setCanAccess] = useState(false);

    useEffect(() => {
        const checkAccess = async () => {
            if (!currentUser) {
                setCanAccess(false);
                setIsChecking(false);
                return;
            }

            try {
                const { isComplete, canBypass } = await ShopService.checkShopSetup(
                    currentUser.uid,
                    currentUser.email
                );

                if (isComplete || canBypass) {
                    setCanAccess(true);
                } else {
                    // Redirect to shop setup
                    navigate('/shop/setup');
                }
            } catch (error) {
                console.error('Error checking shop setup:', error);
                setCanAccess(false);
            } finally {
                setIsChecking(false);
            }
        };

        checkAccess();
    }, [currentUser, navigate]);

    if (isChecking) {
        return fallback || (
            <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#888'
            }}>
                Checking shop setup...
            </div>
        );
    }

    if (!canAccess) {
        return fallback || null;
    }

    return <>{children}</>;
};

export default ShopSetupGate;
