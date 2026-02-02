const { dynamoDb } = require('../config/database');
const { PutCommand, GetCommand, ScanCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('crypto').randomUUID ? { v4: () => require('crypto').randomUUID() } : require('uuid');

const TABLE_NAME = 'Products';

class Product {
  // Create a new product
  static async create(productData) {
    const product = {
      id: uuidv4(),
      name: productData.name,
      price: productData.price,
      url_image: productData.url_image,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const params = {
      TableName: TABLE_NAME,
      Item: product
    };

    await dynamoDb.send(new PutCommand(params));
    return product;
  }

  // Get product by ID
  static async findById(id) {
    const params = {
      TableName: TABLE_NAME,
      Key: { id }
    };

    const result = await dynamoDb.send(new GetCommand(params));
    return result.Item;
  }

  // Get all products
  static async findAll() {
    const params = {
      TableName: TABLE_NAME
    };

    const result = await dynamoDb.send(new ScanCommand(params));
    return result.Items;
  }

  // Update product
  static async update(id, productData) {
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    if (productData.name) {
      updateExpression.push('#name = :name');
      expressionAttributeNames['#name'] = 'name';
      expressionAttributeValues[':name'] = productData.name;
    }

    if (productData.price !== undefined) {
      updateExpression.push('#price = :price');
      expressionAttributeNames['#price'] = 'price';
      expressionAttributeValues[':price'] = productData.price;
    }

    if (productData.url_image) {
      updateExpression.push('#url_image = :url_image');
      expressionAttributeNames['#url_image'] = 'url_image';
      expressionAttributeValues[':url_image'] = productData.url_image;
    }

    updateExpression.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const params = {
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };

    const result = await dynamoDb.send(new UpdateCommand(params));
    return result.Attributes;
  }

  // Delete product
  static async delete(id) {
    const params = {
      TableName: TABLE_NAME,
      Key: { id }
    };

    await dynamoDb.send(new DeleteCommand(params));
    return { message: 'Product deleted successfully' };
  }
}

module.exports = Product;
