import { PutCommand, ScanCommand, GetCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "../services/dynamoService.js";

const TABLE_NAME = "Categories";

/**
 * Repository layer - Handles all DynamoDB operations for Categories
 */
class CategoryRepository {
  
  /**
   * Lấy tất cả categories
   */
  async findAll() {
    const result = await db.send(new ScanCommand({
      TableName: TABLE_NAME
    }));
    return result.Items || [];
  }

  /**
   * Tìm category theo ID
   */
  async findById(id) {
    const result = await db.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { id }
    }));
    return result.Item || null;
  }

  /**
   * Tìm category theo tên
   */
  async findByName(name) {
    const result = await db.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "#name = :name",
      ExpressionAttributeNames: {
        "#name": "name"
      },
      ExpressionAttributeValues: {
        ":name": name
      }
    }));
    return result.Items && result.Items.length > 0 ? result.Items[0] : null;
  }

  /**
   * Tạo category mới
   */
  async create(categoryData) {
    await db.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: categoryData
    }));
    return categoryData;
  }

  /**
   * Cập nhật category
   */
  async update(id, updateData) {
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.keys(updateData).forEach((key, index) => {
      const attributeName = `#attr${index}`;
      const attributeValue = `:val${index}`;
      updateExpressions.push(`${attributeName} = ${attributeValue}`);
      expressionAttributeNames[attributeName] = key;
      expressionAttributeValues[attributeValue] = updateData[key];
    });

    const result = await db.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW"
    }));

    return result.Attributes;
  }

  /**
   * Xóa category
   */
  async delete(id) {
    await db.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id }
    }));
    return true;
  }

  /**
   * Kiểm tra tên category đã tồn tại chưa
   */
  async existsByName(name) {
    const category = await this.findByName(name);
    return category !== null;
  }
}

export default new CategoryRepository();
