import { PutCommand, ScanCommand, GetCommand, UpdateCommand, DeleteCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "../services/dynamoService.js";

const TABLE_NAME = "Products";

/**
 * Repository layer - Handles all DynamoDB operations for Products
 * Không chứa business logic, chỉ thao tác database
 */
class ProductRepository {
  
  /**
   * Lấy tất cả sản phẩm (không bị xóa)
   */
  async findAll() {
    const result = await db.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "attribute_not_exists(isDeleted) OR isDeleted = :false",
      ExpressionAttributeValues: {
        ":false": false
      }
    }));
    return result.Items || [];
  }

  /**
   * Tìm sản phẩm theo ID
   */
  async findById(id) {
    const result = await db.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { id }
    }));
    return result.Item || null;
  }

  /**
   * Tìm sản phẩm theo categoryId
   */
  async findByCategory(categoryId) {
    const result = await db.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "categoryId = :categoryId AND (attribute_not_exists(isDeleted) OR isDeleted = :false)",
      ExpressionAttributeValues: {
        ":categoryId": categoryId,
        ":false": false
      }
    }));
    return result.Items || [];
  }

  /**
   * Tìm kiếm sản phẩm theo tên (contains)
   */
  async searchByName(keyword) {
    const result = await db.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "contains(#name, :keyword) AND (attribute_not_exists(isDeleted) OR isDeleted = :false)",
      ExpressionAttributeNames: {
        "#name": "name"
      },
      ExpressionAttributeValues: {
        ":keyword": keyword,
        ":false": false
      }
    }));
    return result.Items || [];
  }

  /**
   * Lọc sản phẩm theo điều kiện phức tạp
   */
  async filter({ categoryId, minPrice, maxPrice, searchTerm, limit, lastEvaluatedKey }) {
    const filterExpressions = ["(attribute_not_exists(isDeleted) OR isDeleted = :false)"];
    const expressionAttributeValues = { ":false": false };
    const expressionAttributeNames = {};

    if (categoryId) {
      filterExpressions.push("categoryId = :categoryId");
      expressionAttributeValues[":categoryId"] = categoryId;
    }

    if (minPrice !== undefined && minPrice !== null) {
      filterExpressions.push("price >= :minPrice");
      expressionAttributeValues[":minPrice"] = Number(minPrice);
    }

    if (maxPrice !== undefined && maxPrice !== null) {
      filterExpressions.push("price <= :maxPrice");
      expressionAttributeValues[":maxPrice"] = Number(maxPrice);
    }

    if (searchTerm) {
      filterExpressions.push("contains(#name, :searchTerm)");
      expressionAttributeValues[":searchTerm"] = searchTerm;
      expressionAttributeNames["#name"] = "name";
    }

    const params = {
      TableName: TABLE_NAME,
      FilterExpression: filterExpressions.join(" AND "),
      ExpressionAttributeValues: expressionAttributeValues
    };

    if (Object.keys(expressionAttributeNames).length > 0) {
      params.ExpressionAttributeNames = expressionAttributeNames;
    }

    if (limit) {
      params.Limit = limit;
    }

    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = lastEvaluatedKey;
    }

    const result = await db.send(new ScanCommand(params));
    
    return {
      items: result.Items || [],
      lastEvaluatedKey: result.LastEvaluatedKey
    };
  }

  /**
   * Tạo sản phẩm mới
   */
  async create(productData) {
    await db.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: productData
    }));
    return productData;
  }

  /**
   * Cập nhật sản phẩm
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
   * Soft delete - đánh dấu isDeleted = true
   */
  async softDelete(id) {
    const result = await db.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: "SET isDeleted = :true",
      ExpressionAttributeValues: {
        ":true": true
      },
      ReturnValues: "ALL_NEW"
    }));
    return result.Attributes;
  }

  /**
   * Hard delete - xóa vĩnh viễn (chỉ dùng khi cần thiết)
   */
  async hardDelete(id) {
    await db.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id }
    }));
    return true;
  }

  /**
   * Đếm số lượng sản phẩm theo category
   */
  async countByCategory(categoryId) {
    const result = await db.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "categoryId = :categoryId AND (attribute_not_exists(isDeleted) OR isDeleted = :false)",
      ExpressionAttributeValues: {
        ":categoryId": categoryId,
        ":false": false
      },
      Select: "COUNT"
    }));
    return result.Count || 0;
  }
}

export default new ProductRepository();
