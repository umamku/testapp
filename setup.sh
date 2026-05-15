#!/bin/bash
set -e

echo "📦 Installing backend dependencies..."
cd /workspaces/testapp/backend
npm install

echo "🗄️  Pushing database schema..."
npx prisma db push

echo "🌱 Seeding database..."
node prisma/seed.js

echo ""
echo "📦 Installing frontend dependencies..."
cd /workspaces/testapp/frontend
npm install

echo ""
echo "✅ Setup selesai!"
echo ""
echo "Untuk menjalankan aplikasi:"
echo "  Terminal 1 (backend):  cd backend && npm run dev"
echo "  Terminal 2 (frontend): cd frontend && npm run dev"
echo ""
echo "Demo admin: admin@lembagaquran.id / admin123"
