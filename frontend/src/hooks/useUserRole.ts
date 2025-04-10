import { useState, useEffect } from 'react';
import axios from 'axios';

const useUserRole = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:4000/auth/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserRole(response.data.role);
        setError(null);
      } catch (err) {
        console.error('Error fetching user role:', err);
        setError('Failed to fetch user role');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  return { userRole, loading, error };
};

export default useUserRole; 