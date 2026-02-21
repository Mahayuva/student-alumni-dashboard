# 1. Build the Docker image
docker build -t student-alumni-dashboard .

# 2. Run the Docker container
docker run -d \
  --name dashboard-container \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/student_alumni?schema=public" \
  -e NEXTAUTH_SECRET="4/mjSYYkGrEAEIkQ0JoB40LR80v7IePA648A9ApA4nEyOMG/End1xTI2RA0=" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -e GOOGLE_GENERATIVE_AI_API_KEY="YOUR_API_KEY_HERE" \
  student-alumni-dashboard

# Or with Docker Compose (builds and runs both the app and the postgres database):
docker compose up -d --build
