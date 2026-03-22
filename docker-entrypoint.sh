#!/bin/sh

# Exit on any error
set -e

echo "Generating Prisma Client..."
npx prisma generate

echo "Pushing database schema changes..."
# We use db push for now as it's easier for development/syncing.
# If you have migrations, consider 'npx prisma migrate deploy' for production.
npx prisma db push --skip-generate

# Execute the main command (from CMD in Dockerfile or command in docker-compose)
exec "$@"
