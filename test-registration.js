/**
 * TEST REGISTRATION SCRIPT
 * Quick test to verify registration API works
 */

async function testRegistration() {
  console.log('🧪 Testing BhoomiAI Registration API...\n');

  const testUser = {
    fullName: 'Test User',
    email: 'test@example.com',
    phone: '9876543210',
    userType: 'buyer',
    password: 'Test@1234',
    confirmPassword: 'Test@1234'
  };

  try {
    console.log('📤 Sending registration request...');
    console.log('Data:', JSON.stringify(testUser, null, 2), '\n');

    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ Registration successful!');
      console.log('Response:', JSON.stringify(data, null, 2));
      console.log('\n🎉 Backend is working correctly!');
    } else {
      console.log('❌ Registration failed');
      console.log('Response:', JSON.stringify(data, null, 2));

      if (data.message?.includes('already exists')) {
        console.log('\n💡 This user already exists. Try changing the email or delete the user from database.');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔍 Troubleshooting:');
    console.log('1. Make sure backend server is running: npm run backend');
    console.log('2. Make sure you ran the schema.sql to create database tables');
    console.log('3. Check if database is connected (you should see "✅ Database connected successfully")');
  }
}

// Run the test
testRegistration();
