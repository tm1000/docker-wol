#!/bin/bash
# Push Docker image to GitHub Container Registry (GHCR)
# Run this script to manually push the image to GHCR

set -e

# Configuration
GITHUB_USERNAME="tm1000"
REPO_NAME="docker-wol"
IMAGE_NAME="wake-on-lan-api"
VERSION="latest"

echo "=== Pushing Docker Image to GitHub Container Registry ==="
echo ""

# Step 1: Login to GHCR
echo "📦 Step 1: Login to GHCR"
echo "You'll need a GitHub Personal Access Token with 'write:packages' permission"
echo "Create one at: https://github.com/settings/tokens/new"
echo ""
echo "Running: docker login ghcr.io -u ${GITHUB_USERNAME}"
docker login ghcr.io -u ${GITHUB_USERNAME}

# Step 2: Tag the local image for GHCR
echo ""
echo "🏷️  Step 2: Tagging image for GHCR"
GHCR_IMAGE="ghcr.io/${GITHUB_USERNAME}/${IMAGE_NAME}:${VERSION}"
echo "Local image: ${IMAGE_NAME}:${VERSION}"
echo "GHCR image:  ${GHCR_IMAGE}"
docker tag ${IMAGE_NAME}:${VERSION} ${GHCR_IMAGE}

# Step 3: Push to GHCR
echo ""
echo "⬆️  Step 3: Pushing to GHCR"
docker push ${GHCR_IMAGE}

# Step 4: Also tag and push with commit SHA
COMMIT_SHA=$(git rev-parse --short HEAD)
GHCR_IMAGE_SHA="ghcr.io/${GITHUB_USERNAME}/${IMAGE_NAME}:${COMMIT_SHA}"
echo ""
echo "🏷️  Step 4: Tagging with commit SHA: ${COMMIT_SHA}"
docker tag ${IMAGE_NAME}:${VERSION} ${GHCR_IMAGE_SHA}
docker push ${GHCR_IMAGE_SHA}

echo ""
echo "✅ Success! Image pushed to:"
echo "   ${GHCR_IMAGE}"
echo "   ${GHCR_IMAGE_SHA}"
echo ""
echo "📋 To use this image:"
echo "   docker pull ${GHCR_IMAGE}"
echo ""
echo "📝 Note: Make the package public at:"
echo "   https://github.com/users/${GITHUB_USERNAME}/packages/container/${IMAGE_NAME}/settings"
