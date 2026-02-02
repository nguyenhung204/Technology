# DynamoDB CRUD Application

Ứng dụng CRUD Node.js với DynamoDB sử dụng mô hình MVC trên Docker.

## Cấu trúc dự án

```
dynamoDB/
├── app/
│   ├── config/
│   │   └── database.js          # Cấu hình kết nối DynamoDB
│   ├── controllers/
│   │   └── productController.js # Controller xử lý logic
│   ├── models/
│   │   └── productModel.js      # Model Products
│   └── routes/
│       └── productRoutes.js     # Định nghĩa routes
├── scripts/
│   └── initDatabase.js          # Script khởi tạo bảng
├── .env                         # Biến môi trường
├── .gitignore
├── docker-compose.yml           # Cấu hình Docker
├── Dockerfile                   # Docker image cho app
├── package.json
└── server.js                    # Entry point
```

## Cơ sở dữ liệu

**Bảng Products:**
- `id` (String) - Primary Key
- `name` (String) - Tên sản phẩm
- `price` (Number) - Giá sản phẩm
- `url_image` (String) - URL hình ảnh
- `createdAt` (String) - Thời gian tạo
- `updatedAt` (String) - Thời gian cập nhật

## API Endpoints

### 1. Tạo sản phẩm mới
```
POST /api/products
Content-Type: application/json

{
  "name": "Product Name",
  "price": 99.99,
  "url_image": "https://example.com/image.jpg"
}
```

### 2. Lấy tất cả sản phẩm
```
GET /api/products
```

### 3. Lấy sản phẩm theo ID
```
GET /api/products/:id
```

### 4. Cập nhật sản phẩm
```
PUT /api/products/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 149.99,
  "url_image": "https://example.com/new-image.jpg"
}
```

### 5. Xóa sản phẩm
```
DELETE /api/products/:id
```

## Khởi chạy ứng dụng

### 1. Khởi động Docker containers:
```bash
docker-compose up -d
```

### 2. Kiểm tra logs:
```bash
docker-compose logs -f app
```

### 3. Dừng containers:
```bash
docker-compose down
```

## Truy cập

- **API Application:** http://localhost:3000
- **DynamoDB Local:** http://localhost:8000
- **DynamoDB Admin UI:** http://localhost:8009

## Test API với curl

### Tạo sản phẩm:
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","price":999.99,"url_image":"https://example.com/laptop.jpg"}'
```

### Lấy tất cả sản phẩm:
```bash
curl http://localhost:3000/api/products
```

### Lấy sản phẩm theo ID:
```bash
curl http://localhost:3000/api/products/{product-id}
```

### Cập nhật sản phẩm:
```bash
curl -X PUT http://localhost:3000/api/products/{product-id} \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Laptop","price":1299.99}'
```

### Xóa sản phẩm:
```bash
curl -X DELETE http://localhost:3000/api/products/{product-id}
```

## Môi trường phát triển

File [.env](.env) chứa các biến môi trường:
- `AWS_REGION`: Region AWS
- `AWS_ACCESS_KEY_ID`: Access Key (dummy cho local)
- `AWS_SECRET_ACCESS_KEY`: Secret Key (dummy cho local)
- `DYNAMODB_ENDPOINT`: Endpoint DynamoDB Local
- `PORT`: Port của ứng dụng

## Công nghệ sử dụng

- **Node.js** - Runtime
- **Express** - Web framework
- **AWS SDK v3** - DynamoDB client
- **Docker** - Containerization
- **DynamoDB Local** - Local database
- **DynamoDB Admin** - Web UI cho DynamoDB
