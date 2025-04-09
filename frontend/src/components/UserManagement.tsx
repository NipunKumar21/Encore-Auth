import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import useAuth from '../hooks/useAuth';

// Define the API base URL
const API_BASE_URL = 'http://localhost:4000';

// User interface
interface User {
  id: string;
  email: string;
  role: string;
  lastLogin: string | null;
  twoFactorEnabled: boolean;
  joinedDate: string;
}

// UserManagement component
const UserManagement: React.FC = () => {

    useAuth();
  // State variables
  const navigate =useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<{
    email: string;
    password: string;
    role: string;
  }>({
    email: '',
    password: '',
    role: 'user'
  });
  const [editUser, setEditUser] = useState<{
    email: string;
    role: string;
  }>({
    email: '',
    role: 'user'
  });

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users from the API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Handle the new response structure
      if (response.data && response.data.users) {
        setUsers(response.data.users);
        setError(null);
      } else {
        setError('Invalid response format from server');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 403) {
          setError('You do not have permission to access user management.');
        } else if (err.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else {
          setError('Failed to fetch users. Please try again later.');
        }
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open add user modal
  const handleAddUser = () => {
    setNewUser({
      email: '',
      password: '',
      role: 'user'
    });
    setShowAddModal(true);
  };

  // Open edit user modal
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditUser({
      email: user.email,
      role: user.role
    });
    setShowEditModal(true);
  };

  // Open delete user modal
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Handle new user input change
  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle edit user input change
  const handleEditUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit new user
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      await axios.post(`${API_BASE_URL}/users`, newUser, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setShowAddModal(false);
      fetchUsers();
    } catch (err) {
      console.error('Error adding user:', err);
      setError('Failed to add user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Submit edited user
  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      await axios.put(`${API_BASE_URL}/users/${selectedUser.id}`, editUser, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDeleteUserConfirm = async () => {
    if (!selectedUser) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      await axios.delete(`${API_BASE_URL}/users/${selectedUser.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setShowDeleteModal(false);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  return (
    
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <header className="text-gray-600 body-font fixed top-0 left-0 right-0 bg-gray-800 z-10">
        <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
          <a className="flex title-font font-medium items-center text-white mb-4 md:mb-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="w-10 h-10 text-white p-2 bg-blue-500 rounded-full"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <span className="ml-3 text-xl text-white hover:cursor-pointer" onClick={()=>navigate("/home")}>My-App</span>
          </a>
          <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center">
            <a
              className="mr-5 hover:text-white cursor-pointer "
              onClick={() => navigate("/home")}
            >
              Home
            </a>
            <a
              className="mr-5 hover:text-white cursor-pointer "
              onClick={() => navigate("/admin/users")}
            >
              User Management
            </a>
          </nav>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm px-3 py-3 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              type="button"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-lg w-48 dark:bg-gray-700">
                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                  <li>
                    <a
                      onClick={() => navigate('/profile')}
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
                    >
                      My Profile
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => navigate('/settings')}
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
                    >
                      Settings
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => navigate('/activity')}
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
                    >
                      Activity Log
                    </a>
                  </li>

                </ul>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto">
        <div className="sm:flex sm:items-center sm:justify-between mb-6 mt-16 pt-8">
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <button
            onClick={handleAddUser}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add User
          </button>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <div className="max-w-md">
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="block w-full pr-10 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Users table */}
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-600">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Email</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Role</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Last Login</th>
                      <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-white">2FA</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Joined Date</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-gray-800">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-4 text-sm text-white text-center">
                          <div className="flex justify-center items-center">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="ml-2">Loading users...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-4 text-sm text-white text-center">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map(user => (
                        <tr key={user.id} >
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">{user.email}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-white capitalize">{user.role}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-white">{formatDate(user.lastLogin)}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                            <span className={`inline-flex h-2 w-2 rounded-full ${user.twoFactorEnabled ? 'bg-green-400' : 'bg-red-400'}`}></span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-white">{formatDate(user.joinedDate)}</td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <div className="flex justify-end space-x-3">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="text-blue-400 hover:text-blue-300 px-2 py-1 rounded"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="text-red-400 hover:text-red-300 px-2 py-1 rounded"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-100 transition-opacity">
            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-lg bg-gray-900 px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="absolute top-0 right-0 pt-4 pr-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="rounded-md bg-gray-900 text-white hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <span className="sr-only">Close</span>
                      <svg className="h-5 w-5 font-bold" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg font-semibold leading-6 text-white">Add New User</h3>
                      <form onSubmit={handleAddUserSubmit} className="mt-6 bg-gray-800 rounded-lg p-3">
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-white">Email</label>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              value={newUser.email}
                              onChange={handleNewUserChange}
                              required
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-white">Password</label>
                            <input
                              type="password"
                              name="password"
                              id="password"
                              value={newUser.password}
                              onChange={handleNewUserChange}
                              required
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="role" className="block text-md font-semibold text-white">Role</label>
                            <select
                              name="role"
                              id="role"
                              value={newUser.role}
                              onChange={handleNewUserChange}
                              className="mt-1 block w-full rounded-md border-1 bg-gray-700 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-md "
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                        </div>
                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-semibold  text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                          >
                            {loading ? 'Adding...' : 'Add User'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAddModal(false)}
                            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-gray-900 px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-700 bg-opacity-75 transition-opacity">
            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-lg bg-gray-900 px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="absolute top-0 right-0 pt-4 pr-4">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="rounded-md bg-gray-900 text-white hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <span className="sr-only">Close</span>
                      <svg className="h-5 w-5 font-bold" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg font-medium leading-6 text-white">Edit User</h3>
                      <form onSubmit={handleEditUserSubmit} className="mt-4 bg-gray-900 rounded-lg p-4">
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="edit-email" className="block text-sm font-medium text-white">Email</label>
                            <input
                              type="email"
                              name="email"
                              id="edit-email"
                              value={editUser.email}
                              onChange={handleEditUserChange}
                              required
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-gray-800"
                            />
                          </div>
                          <div>
                            <label htmlFor="edit-role" className="block text-sm font-medium text-white ">Role</label>
                            <select
                              name="role"
                              id="edit-role"
                              value={editUser.role}
                              onChange={handleEditUserChange}
                              className="mt-1 block w-full rounded-md border-1 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-gray-800"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                        </div>
                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                          >
                            {loading ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowEditModal(false)}
                            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-gray-900 px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete User Modal */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-700 bg-opacity-75 transition-opacity">
            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-lg bg-gray-900 px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg font-medium leading-6 text-white">Delete User</h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-300">
                          Are you sure you want to delete the user <strong>{selectedUser.email}</strong>? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      onClick={handleDeleteUserConfirm}
                      disabled={loading}
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {loading ? 'Deleting...' : 'Delete User'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(false)}
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-gray-900 px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement; 