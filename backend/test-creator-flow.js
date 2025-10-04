const express = require('express');
const { verifyToken, requireAdmin, requireCreator } = require('./src/middleware/auth');

// Test creator request flow
console.log('🧪 Testing Creator Request Flow...\n');

// Mock request objects for testing
const mockCreatorReq = {
  user: { 
    id: 'creator-user-id',
    role: 'creator',
    email: 'creator@example.com'
  },
  headers: { authorization: 'Bearer test-token' }
};

const mockAdminReq = {
  user: { 
    id: 'admin-user-id',
    role: 'admin',
    email: 'admin@example.com'
  },
  headers: { authorization: 'Bearer test-token' }
};

const mockClipperReq = {
  user: { 
    id: 'clipper-user-id',
    role: 'clipper',
    email: 'clipper@example.com'
  },
  headers: { authorization: 'Bearer test-token' }
};

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

// Test different scenarios
console.log('1. Testing Creator role (should pass creator check):');
requireCreator(mockCreatorReq, mockRes(), mockNext);

console.log('\n2. Testing Admin role (should pass creator check):');
requireCreator(mockAdminReq, mockRes(), mockNext);

console.log('\n3. Testing Clipper role (should fail creator check):');
requireCreator(mockClipperReq, mockRes(), mockNext);

console.log('\n4. Testing Admin role (should pass admin check):');
requireAdmin(mockAdminReq, mockRes(), mockNext);

console.log('\n5. Testing Creator role (should fail admin check):');
requireAdmin(mockCreatorReq, mockRes(), mockNext);

console.log('\n✅ Creator request flow test completed!');
console.log('\n📋 Flow Summary:');
console.log('1. Creator fills out campaign form');
console.log('2. Form submits to /api/creator-requests (POST)');
console.log('3. Admin sees request in admin panel');
console.log('4. Admin approves/rejects request');
console.log('5. Creator sees status update in My Campaigns');
console.log('6. If approved, creator sees "Pay" button');

