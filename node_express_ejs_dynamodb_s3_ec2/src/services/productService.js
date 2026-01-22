import { PutCommand, ScanCommand, GetCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "./dynamoService.js";
import { uploadImage, deleteImage, getImageUrl } from "./s3Service.js";
import Product from "../models/product.js";

const TABLE_NAME = process.env.DYNAMODB_TABLE || "Products";

// Lấy tất cả sản phẩm
export const getAllProducts = async () => {
  try {
    const result = await db.send(new ScanCommand({
      TableName: TABLE_NAME
    }));
    return result.Items ? result.Items.map(item => Product.fromDynamo(item)) : [];
  } catch (error) {
    console.error("Error getting all products:", error);
    throw error;
  }
};

// Lấy sản phẩm theo ID
export const getProductById = async (id) => {
  try {
    const result = await db.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { id }
    }));
    return result.Item ? Product.fromDynamo(result.Item) : null;
  } catch (error) {
    console.error("Error getting product by id:", error);
    throw error;
  }
};

// Tạo sản phẩm mới
export const createProduct = async (formData, imageFile) => {
  try {
    const productId = crypto.randomUUID();
    let imageUrl = null;

    // Upload ảnh lên S3 nếu có
    if (imageFile) {
      const imageKey = `products/${productId}/${imageFile.originalname}`;
      await uploadImage(imageFile, imageKey);
      imageUrl = getImageUrl(imageKey);
    }

    // Tạo product object
    const product = new Product({
      id: productId,
      name: formData.name,
      price: Number(formData.price),
      quantity: Number(formData.quantity),
      url_image: imageUrl
    });

    // Lưu vào DynamoDB
    await db.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: product
    }));

    return product;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

// Cập nhật sản phẩm
export const updateProduct = async (id, formData, imageFile) => {
  try {
    const existingProduct = await getProductById(id);
    if (!existingProduct) {
      throw new Error("Product not found");
    }

    let imageUrl = existingProduct.url_image;

    // Upload ảnh mới nếu có
    if (imageFile) {
      const imageKey = `products/${id}/${imageFile.originalname}`;
      await uploadImage(imageFile, imageKey);
      imageUrl = getImageUrl(imageKey);

      // Xóa ảnh cũ nếu có
      if (existingProduct.url_image) {
        const oldKey = extractKeyFromUrl(existingProduct.url_image);
        if (oldKey) {
          try {
            await deleteImage(oldKey);
          } catch (err) {
            console.log("Could not delete old image:", err.message);
          }
        }
      }
    }

    // Cập nhật trong DynamoDB
    const result = await db.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: "SET #name = :name, price = :price, quantity = :quantity, url_image = :url_image",
      ExpressionAttributeNames: {
        "#name": "name"
      },
      ExpressionAttributeValues: {
        ":name": formData.name,
        ":price": Number(formData.price),
        ":quantity": Number(formData.quantity),
        ":url_image": imageUrl
      },
      ReturnValues: "ALL_NEW"
    }));

    return Product.fromDynamo(result.Attributes);
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// Xóa sản phẩm
export const deleteProduct = async (id) => {
  try {
    const product = await getProductById(id);
    if (!product) {
      throw new Error("Product not found");
    }

    // Xóa ảnh trong S3 nếu có
    if (product.url_image) {
      const imageKey = extractKeyFromUrl(product.url_image);
      if (imageKey) {
        try {
          await deleteImage(imageKey);
        } catch (err) {
          console.log("Could not delete image:", err.message);
        }
      }
    }

    // Xóa khỏi DynamoDB
    await db.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id }
    }));

    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// Helper function để lấy key từ S3 URL
const extractKeyFromUrl = (url) => {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1); // Bỏ dấu "/" ở đầu
  } catch {
    return null;
  }
};
