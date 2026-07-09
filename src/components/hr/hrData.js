import { useEffect, useState } from 'react';

const STORAGE_KEY = 'constructpro.hr.employees';

export const defaultEmployees = [
  { id: 1, name: 'Pushpraj Tiwari', dept: 'Sales', role: 'Senior Sales Executive', mobile: '9876543210', join: '15 Jan 2024', salary: 35000, status: 'Active' },
  { id: 2, name: 'Aman Verma', dept: 'Sales', role: 'Sales Executive', mobile: '9765432109', join: '01 Mar 2024', salary: 28000, status: 'Active' },
  { id: 3, name: 'Kumar Singh', dept: 'Sales', role: 'Sales Manager', mobile: '9654321098', join: '10 Nov 2023', salary: 55000, status: 'Active' },
  { id: 4, name: 'Ravi Sharma', dept: 'Site', role: 'Site Supervisor', mobile: '9543210987', join: '01 Jun 2024', salary: 22000, status: 'Active' },
  { id: 5, name: 'Sneha Patel', dept: 'Marketing', role: 'Digital Marketing Exec', mobile: '9432109876', join: '15 Aug 2024', salary: 30000, status: 'Active' },
  { id: 6, name: 'Ramesh Keshari', dept: 'Site', role: 'Civil Engineer', mobile: '9321098765', join: '01 Feb 2024', salary: 45000, status: 'Active' },
  { id: 7, name: 'Priya Dubey', dept: 'Accounts', role: 'Accountant', mobile: '9210987654', join: '01 Apr 2024', salary: 32000, status: 'Active' },
];

export const deptColor = {
  Sales: 'blue',
  Site: 'orange',
  Marketing: 'purple',
  Accounts: 'green',
  Admin: 'grey',
};

export const leaveRequests = [
  { emp: 'Kumar Singh', type: 'Casual', from: '25 Nov 2025', to: '25 Nov 2025', days: 1, reason: 'Personal work', status: 'Approved' },
  { emp: 'Ravi Sharma', type: 'Sick', from: '20 Nov 2025', to: '21 Nov 2025', days: 2, reason: 'Fever', status: 'Approved' },
  { emp: 'Sneha Patel', type: 'Casual', from: '28 Nov 2025', to: '29 Nov 2025', days: 2, reason: 'Family function', status: 'Pending' },
];

function readStoredEmployees() {
  if (typeof window === 'undefined') {
    return defaultEmployees;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultEmployees;
  } catch {
    return defaultEmployees;
  }
}

export function useHrEmployees() {
  const [employees, setEmployees] = useState(readStoredEmployees);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  }, [employees]);

  return [employees, setEmployees];
}
