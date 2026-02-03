import { PutCommand, ScanCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "../services/dynamoService.js";

const TABLE_NAME = "Users";

/**
 * Repository layer - Handles all DynamoDB operations for Users
 */
class UserRepository {
  
  /**
   * Tìm user theo id (Primary Key)
   */
  async findById(id) {
    const result = await db.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { id }
    }));
    return result.Item || null;
  }

  /**
   * Tìm user theo username
   * Note: Scan operation vì username không phải là key
   * Trong production, nên tạo GSI (Global Secondary Index) cho username
   */
  async findByUsername(username) {
    const result = await db.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "username = :username",
      ExpressionAttributeValues: {
        ":username": username
      }
    }));
    return result.Items && result.Items.length > 0 ? result.Items[0] : null;
  }

  /**
   * Lấy tất cả users
   */
  async findAll() {
    const result = await db.send(new ScanCommand({
      TableName: TABLE_NAME
    }));
    return result.Items || [];
  }

  /**
   * Lấy users theo role
   */
  async findByRole(role) {
    const result = await db.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "#role = :role",
      ExpressionAttributeNames: {
        "#role": "role"
      },
      ExpressionAttributeValues: {
        ":role": role
      }
    }));
    return result.Items || [];
  }

  /**
   * Tạo user mới
   */
  async create(userData) {
    await db.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: userData,
      ConditionExpression: "attribute_not_exists(id)"
    }));
    return userData;
  }

  /**
   * Kiểm tra username đã tồn tại chưa
   */
  async existsByUsername(username) {
    const user = await this.findByUsername(username);
    return user !== null;
  }
}

export default new UserRepository();
