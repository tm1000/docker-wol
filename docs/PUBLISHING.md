# Publishing Docker Images to GitHub

This guide explains how to publish your Docker images to GitHub Container Registry (GHCR).

## Quick Start

```bash
# Run the automated script
./scripts/push-to-ghcr.sh
```

## Manual Steps

### 1. Create GitHub Personal Access Token

1. Go to https://github.com/settings/tokens/new
2. Give it a descriptive name: "Docker GHCR Push"
3. Select scopes:
   - ✅ `write:packages` - Upload packages to GitHub Package Registry
   - ✅ `read:packages` - Download packages from GitHub Package Registry
   - ✅ `delete:packages` - Delete packages from GitHub Package Registry (optional)
4. Click "Generate token"
5. **SAVE THE TOKEN** - you won't see it again!

### 2. Login to GitHub Container Registry

```bash
# Use your GitHub username and the token from step 1
echo YOUR_TOKEN | docker login ghcr.io -u tm1000 --password-stdin

# Or interactive login (will prompt for password):
docker login ghcr.io -u tm1000
# When prompted for password, paste your Personal Access Token
```

### 3. Tag Your Image

```bash
# Tag for GHCR (replace tm1000 with your GitHub username)
docker tag wake-on-lan-api:latest ghcr.io/tm1000/wake-on-lan-api:latest

# Optionally tag with version
docker tag wake-on-lan-api:latest ghcr.io/tm1000/wake-on-lan-api:v1.0.0

# Tag with commit SHA for traceability
docker tag wake-on-lan-api:latest ghcr.io/tm1000/wake-on-lan-api:$(git rev-parse --short HEAD)
```

### 4. Push to GHCR

```bash
# Push latest tag
docker push ghcr.io/tm1000/wake-on-lan-api:latest

# Push version tag (if created)
docker push ghcr.io/tm1000/wake-on-lan-api:v1.0.0

# Push SHA tag (if created)
docker push ghcr.io/tm1000/wake-on-lan-api:$(git rev-parse --short HEAD)
```

### 5. Make Package Public (Optional)

By default, packages are private. To make it public:

1. Go to https://github.com/users/tm1000/packages/container/wake-on-lan-api/settings
2. Scroll to "Danger Zone"
3. Click "Change visibility"
4. Select "Public"
5. Confirm

## Automated Publishing with GitHub Actions

The repository already includes a GitHub Actions workflow (`.github/workflows/docker-publish.yml`) that automatically builds and pushes images when you:

1. Push to `main` branch
2. Create a git tag (e.g., `v1.0.0`)

### Setup GitHub Actions Secrets

The automated workflow is already configured to use GitHub's built-in `GITHUB_TOKEN`, which has permissions to push to GHCR. No additional secrets needed for GHCR!

**For Docker Hub** (optional):
1. Go to your repository on GitHub
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add secrets:
   - Name: `DOCKERHUB_USERNAME`, Value: your Docker Hub username
   - Name: `DOCKERHUB_TOKEN`, Value: your Docker Hub access token

### Trigger Automated Build

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions will automatically:
# 1. Build multi-platform images (amd64, arm64)
# 2. Push to ghcr.io/tm1000/wake-on-lan-api:latest
# 3. Push to ghcr.io/tm1000/wake-on-lan-api:v1.0.0
# 4. Push to ghcr.io/tm1000/wake-on-lan-api:1.0
# 5. Push to ghcr.io/tm1000/wake-on-lan-api:1
# 6. (Optional) Push to Docker Hub if secrets configured
```

## Pulling the Published Image

Once published, anyone can pull your image:

```bash
# Pull from GHCR (if public)
docker pull ghcr.io/tm1000/wake-on-lan-api:latest

# Pull specific version
docker pull ghcr.io/tm1000/wake-on-lan-api:v1.0.0

# Run the container
docker run -d \
  --name wol-api \
  --network host \
  -e API_KEY=your-secret-key \
  ghcr.io/tm1000/wake-on-lan-api:latest
```

## Image Naming Convention

The GitHub Actions workflow uses these tags:

- `latest` - Most recent build from main branch
- `v1.0.0` - Semantic version from git tag
- `1.0` - Major.minor version
- `1` - Major version only
- `main-abc123f` - Branch name + commit SHA
- `pr-123` - Pull request number

## Troubleshooting

### "denied: permission_denied"

**Solution**: Make sure your Personal Access Token has `write:packages` scope.

### "unauthorized: authentication required"

**Solution**: Run `docker login ghcr.io -u tm1000` again with your token.

### "layer does not exist"

**Solution**: Rebuild the image locally first:
```bash
docker build -t wake-on-lan-api:latest .
```

### "repository name must be lowercase"

**Solution**: GitHub packages require lowercase names. Our repository is already correctly named.

## Best Practices

1. **Use semantic versioning**: Tag releases as `v1.0.0`, `v1.1.0`, etc.
2. **Keep packages public**: Makes it easier for users to pull images
3. **Link to repository**: GHCR automatically links if image is built from GitHub Actions
4. **Add package description**: Edit package settings to add description and README
5. **Regular updates**: Keep base images updated for security

## Resources

- [GitHub Container Registry Documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
