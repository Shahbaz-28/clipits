const express = require('express');
const { verifyToken, requireAdmin, requireCreator, requireClipper } = require('./src/middleware/auth');

// Test role middleware
console.log('🧪 Testing Role System...\n');

// Mock request objects for testing
const mockReq = (role) => ({
  user: { role },
  headers: { authorization: 'Bearer test-token' }
});

const mockRes = () => {
  const res = {};
  res.status = (code) => {
    console.log(`Status: ${code}`);
    return res;
  };
  res.json = (data) => {
    console.log('Response:', data);
    return res;
  };
  return res;
};

const mockNext = () => {
  console.log('✅ Middleware passed');
};

// Test different roles
console.log('1. Testing Admin role:');
requireAdmin(mockReq('admin'), mockRes(), mockNext);

console.log('\n2. Testing Creator role (should fail admin check):');
requireAdmin(mockReq('creator'), mockRes(), mockNext);

console.log('\n3. Testing Creator role (should pass creator check):');
requireCreator(mockReq('creator'), mockRes(), mockNext);

console.log('\n4. Testing Clipper role (should fail creator check):');
requireCreator(mockReq('clipper'), mockRes(), mockNext);

console.log('\n5. Testing Clipper role (should pass clipper check):');
requireClipper(mockReq('clipper'), mockRes(), mockNext);

console.log('\n6. Testing Admin role (should pass all checks):');
requireClipper(mockReq('admin'), mockRes(), mockNext);

console.log('\n✅ Role system test completed!');


