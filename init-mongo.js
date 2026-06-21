// MongoDB initialization script
// This runs automatically when MongoDB container starts for the first time

// Connect to the admin database
db = db.getSiblingDB('admin');

// Create the application database user (optional, for security)
// Uncomment if you want a separate user for the application
/*
db.createUser({
  user: 'app_user',
  pwd: 'app_password_secure',
  roles: [
    {
      role: 'readWrite',
      db: 'i_dashboard'
    }
  ]
});
*/

// Switch to application database
db = db.getSiblingDB('i_dashboard');

// Create collections with schema validation
db.createCollection('users');
db.createCollection('products');
db.createCollection('orders');
db.createCollection('banners');
db.createCollection('payments');

// Create indexes for better query performance
db.users.createIndex({ email: 1 }, { unique: true });
db.products.createIndex({ name: 1 });
db.orders.createIndex({ userId: 1 });
db.orders.createIndex({ createdAt: 1 });
db.banners.createIndex({ active: 1 });

print('MongoDB initialization completed successfully!');
print('Database: i_dashboard');
print('Root User: admin');
print('Collections created: users, products, orders, banners, payments');
