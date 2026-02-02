const { CreateTableCommand } = require('@aws-sdk/client-dynamodb');
const { client } = require('../app/config/database');
require('dotenv').config();

const createProductsTable = async () => {
  const params = {
    TableName: 'Products',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' } // Partition key
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' } // S = String
    ],
    BillingMode: 'PAY_PER_REQUEST' // On-demand billing
  };

  try {
    console.log('Creating Products table...');
    await client.send(new CreateTableCommand(params));
    console.log('✓ Products table created successfully!');
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log('⚠ Products table already exists');
    } else {
      console.error('Error creating table:', error);
      throw error;
    }
  }
};

// Run the initialization
createProductsTable()
  .then(() => {
    console.log('Database initialization completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  });
