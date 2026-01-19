# cms-backend
DATABASE_URL="postgres://3c66abf20c6e4a882990dea72db0cfef7c045dcee65db233524bcaa84e7645dd:sk_sXlVaBhw-g2JUyLWviugh@db.prisma.io:5432/postgres?sslmode=require"
PORT=3001
CORS_ORIGIN="http://localhost:5173,http://localhost:3000"
NODE_ENV="development"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760 # 10MB
SLICE_WEBHOOK_URLS=http://localhost:3000/api/webhooks/slices
WEBHOOK_SECRET=your-secret-key-change-this

# Webhook Configuration
WEBHOOK_URL=http://localhost:3000/api/webhooks
