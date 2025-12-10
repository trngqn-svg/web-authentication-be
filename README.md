## Cài đặt

1. Clone repository:

```bash
git clone https://github.com/trngqn-svg/web-authentication-be.git
cd web-authentication-be
```

2. Tạo file env:
```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/
BCRYPT_SALT=your_salt
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
```

3. Cài đặt các package
```bash
npm install
```

4. Chạy dự án
```bash
npm start
```